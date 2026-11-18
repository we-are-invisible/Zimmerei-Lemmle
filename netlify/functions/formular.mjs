// Nimmt Anfrage und Bewerbung von der Website an und schickt sie als Mail an Günter.
// Nichts wird gespeichert. PDFs gehen als Anhang mit.
//
// Umgebungsvariablen in Netlify (Site configuration > Environment variables):
//   RESEND_API_KEY   API-Schlüssel aus Resend
//   MAIL_EMPFAENGER  z. B. holz@lemmle.net
//   MAIL_ABSENDER    z. B. Website Zimmerei Lemmle <website@lemmle.net> (Domain muss in Resend bestätigt sein)

export const config = { path: '/api/formular' };

const MAX_BYTES = 4.2 * 1024 * 1024;   // alle PDFs zusammen
const MAX_PDFS = 4;                    // Lebenslauf + bis zu 3 Zeugnisse
const RESEND_URL = 'https://api.resend.com/emails';

const json = (status, body) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8' } });

const text = (fd, name, max = 5000) => String(fd.get(name) ?? '').trim().slice(0, max);
const istMail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s) && s.length <= 254;
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const einzeilig = (s) => s.replace(/[\r\n]+/g, ' ');
const dateiname = (s) => (String(s || 'dokument.pdf').replace(/[^\w.\- äöüÄÖÜß()]/g, '_').slice(0, 120) || 'dokument.pdf');

function mailInhalt(titel, zeilen) {
  const html =
    `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5;color:#1C1916">` +
    `<h2 style="margin:0 0 16px;font-size:18px">${esc(titel)}</h2>` +
    `<table cellpadding="6" style="border-collapse:collapse">` +
    zeilen
      .filter(([, w]) => w)
      .map(([k, w]) => `<tr><td style="vertical-align:top;color:#57514A;white-space:nowrap">${esc(k)}</td><td>${esc(w).replace(/\n/g, '<br>')}</td></tr>`)
      .join('') +
    `</table><p style="margin-top:20px;color:#57514A;font-size:13px">Gesendet über das Formular auf der Website. Mit „Antworten“ schreibst du direkt an die Person zurück.</p></div>`;
  const plain = titel + '\n\n' + zeilen.filter(([, w]) => w).map(([k, w]) => `${k}: ${w}`).join('\n');
  return { html, text: plain };
}

export default async (req) => {
  if (req.method !== 'POST') return json(405, { ok: false, fehler: 'methode' });

  let fd;
  try { fd = await req.formData(); } catch { return json(400, { ok: false, fehler: 'daten' }); }

  // Spam: verstecktes Feld ausgefüllt oder in unter 3 Sekunden abgeschickt -> still verwerfen
  const t = Number(fd.get('t') || 0);
  if (text(fd, 'firma') || (t && Date.now() - t < 3000)) return json(200, { ok: true });

  const typ = text(fd, 'typ', 20);
  const vorname = einzeilig(text(fd, 'vorname', 80));
  const nachname = einzeilig(text(fd, 'nachname', 80));
  const email = text(fd, 'email', 254);
  const telefon = einzeilig(text(fd, 'telefon', 40));
  const beschreibung = text(fd, 'beschreibung', 5000);
  if (!vorname || !nachname || !istMail(email) || !fd.get('datenschutz')) return json(400, { ok: false, fehler: 'pflichtfelder' });

  const name = `${vorname} ${nachname}`;
  let betreff, titel, zeilen;
  const anhaenge = [];

  if (typ === 'anfrage') {
    const arten = fd.getAll('art').map((a) => einzeilig(String(a)).slice(0, 60)).filter(Boolean).slice(0, 12);
    if (!arten.length || beschreibung.length < 5) return json(400, { ok: false, fehler: 'pflichtfelder' });
    betreff = `Anfrage: ${arten.join(', ')}, ${name}`;
    titel = 'Neue Anfrage über die Website';
    zeilen = [['Name', name], ['E-Mail', email], ['Telefon', telefon], ['Projekt', arten.join(', ')], ['Beschreibung', beschreibung]];
  } else if (typ === 'bewerbung') {
    const stelle = einzeilig(text(fd, 'stelle', 80));
    const dateien = [...fd.getAll('lebenslauf'), ...fd.getAll('zeugnisse')].filter((d) => d && typeof d === 'object' && d.size > 0);
    if (!stelle || !fd.getAll('lebenslauf').length) return json(400, { ok: false, fehler: 'pflichtfelder' });
    if (dateien.length > MAX_PDFS) return json(400, { ok: false, fehler: 'zu_viele_dateien' });
    let summe = 0;
    for (const d of dateien) {
      summe += d.size;
      if (summe > MAX_BYTES) return json(413, { ok: false, fehler: 'zu_gross' });
      const buf = Buffer.from(await d.arrayBuffer());
      if (buf.subarray(0, 4).toString('latin1') !== '%PDF') return json(400, { ok: false, fehler: 'kein_pdf' });
      anhaenge.push({ filename: dateiname(d.name), content: buf.toString('base64') });
    }
    betreff = `Bewerbung: ${stelle}, ${name}`;
    titel = 'Neue Bewerbung über die Website';
    zeilen = [['Stelle', stelle], ['Name', name], ['E-Mail', email], ['Telefon', telefon], ['Über sich', beschreibung], ['Anhänge', anhaenge.map((a) => a.filename).join(', ')]];
  } else {
    return json(400, { ok: false, fehler: 'typ' });
  }

  const { RESEND_API_KEY, MAIL_EMPFAENGER, MAIL_ABSENDER } = process.env;
  if (!RESEND_API_KEY || !MAIL_EMPFAENGER || !MAIL_ABSENDER) {
    console.error('Umgebungsvariablen fehlen');
    return json(500, { ok: false, fehler: 'konfiguration' });
  }

  const inhalt = mailInhalt(titel, zeilen);
  const antwort = await fetch(process.env.RESEND_URL || RESEND_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: MAIL_ABSENDER,
      to: MAIL_EMPFAENGER.split(',').map((s) => s.trim()),
      reply_to: email,
      subject: betreff.slice(0, 200),
      html: inhalt.html,
      text: inhalt.text,
      attachments: anhaenge.length ? anhaenge : undefined,
    }),
  }).catch((e) => ({ ok: false, status: 0, text: async () => String(e) }));

  if (!antwort.ok) {
    console.error('Resend', antwort.status, await antwort.text());
    return json(502, { ok: false, fehler: 'versand' });
  }
  return json(200, { ok: true });
};
