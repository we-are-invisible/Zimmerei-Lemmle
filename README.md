# Website Zimmerei Lemmle

Statische Website ohne Build-Schritt, gehostet bei Netlify. Die Domain bleibt bei Strato.

```
public/                     alles, was online geht
  index.html                Startseite
  baustellen/index.html     /baustellen/
  jobs/index.html           /jobs/ (Bewerbung)
  datenschutz/index.html    /datenschutz/ (Text fehlt noch)
  assets/                   style.css, start.js, baustellen.js, jobs.js
  bilder/                   Fotos
  fonts/                    Schriften lokal (kein Google-Server, DSGVO)
netlify/functions/formular.mjs   nimmt beide Formulare an und schickt sie per Resend als Mail
netlify.toml                     Netlify-Einstellungen
```

## So laufen die Formulare

Anfrage und Bewerbung schicken an dieselbe Adresse `/api/formular`. Die Funktion macht daraus eine Mail an Günter und speichert nichts.

- Betreff Anfrage: `Anfrage: Carport oder Überdachung, Max Muster`
- Betreff Bewerbung: `Bewerbung: Zimmermann (Geselle), Erika Holz`, Lebenslauf und Zeugnisse hängen als PDF dran
- Antwortadresse ist immer die Person, die das Formular ausgefüllt hat
- Spamschutz: verstecktes Feld und Mindestzeit von 3 Sekunden
- Alle PDFs zusammen höchstens 4 MB (Netlify nimmt pro Aufruf maximal 6 MB an, Dateien werden dabei um rund ein Drittel größer)

## Einrichtung, einmalig

Alle Konten mit Günters Adresse holz@lemmle.net anlegen. (in)visible wird jeweils als Teammitglied eingeladen.

### 1. GitHub
Repo anlegen (privat) und diesen Ordner hochladen.

### 2. Resend (Mailversand, kostenlos bis 3.000 Mails im Monat)
1. Konto anlegen auf resend.com
2. Domains > Add Domain > `lemmle.net`, Region **EU (Ireland)** wählen
3. Resend zeigt danach 2 bis 3 DNS-Einträge (TXT für SPF und DKIM, evtl. MX für `send`). Diese bei Strato eintragen (siehe Schritt 4). Wichtig: Nur neue Einträge für die Subdomains, die Resend nennt. Die bestehenden MX-Einträge von lemmle.net nicht anfassen, sonst kommen Günters Mails nicht mehr an.
4. API Keys > Create API Key, Rechte „Sending access“, Domain `lemmle.net`. Den Schlüssel kopieren.
5. Unter Settings den Vertrag zur Auftragsverarbeitung (DPA) annehmen.

### 3. Netlify (Hosting, kostenloser Tarif)
1. Konto anlegen auf netlify.com, mit GitHub verbinden
2. Add new project > Import from Git > dieses Repo. Build-Befehl leer lassen, Publish directory steht schon in `netlify.toml`.
3. Site configuration > Environment variables:
   - `RESEND_API_KEY` = Schlüssel aus Resend
   - `MAIL_EMPFAENGER` = `holz@lemmle.net`
   - `MAIL_ABSENDER` = `Website Zimmerei Lemmle <website@lemmle.net>`
4. Neu deployen, dann auf der Netlify-Adresse (…netlify.app) beide Formulare einmal testen.
5. Domain management > Add a domain > die Domain eintragen (z. B. `zimmerei-lemmle.de` oder `lemmle.net`). Netlify zeigt die Werte für Schritt 4.

### 4. Strato (Domain bleibt dort)
Im Strato-Kundenlogin unter Domains > Verwaltung > DNS:
- **A-Eintrag** der Hauptdomain auf die IP, die Netlify anzeigt (derzeit `75.2.60.5`)
- **CNAME** für `www` auf die Netlify-Adresse (`<name>.netlify.app`)
- die TXT/MX-Einträge von Resend aus Schritt 2
- **MX-Einträge der Hauptdomain unverändert lassen**

Die Umstellung braucht ein paar Minuten bis zu einem Tag. Danach in Netlify unter HTTPS das kostenlose Zertifikat anfordern (passiert meist automatisch).

## Vor dem Livegang noch offen

- Datenschutzerklärung (`public/datenschutz/index.html`): Netlify als Hoster, Resend als Mailversand, beide Formulare inkl. Lebenslauf, keine Cookies, keine externen Schriften
- Impressum: Festnetznummer und USt-IdNr. (Platzhalter in allen vier HTML-Dateien, Fußzeile)
- Stellenanzeige von Günter, danach Auswahl im Bewerbungsformular anpassen
- Kundenstimmen (Platzhalter auf der Startseite)
- Die drei KI-Symbolbilder (`ki_werkstatt`, `ki_holzfassade`, `ki_neubau`) durch echte Fotos ersetzen
- Alte URLs der bisherigen Seite prüfen und in `netlify.toml` per Redirect auf die neuen Seiten leiten

## Lokal testen

Ohne Formulare reicht jeder einfache Webserver im Ordner `public/`. Mit Formularen: `npx netlify-cli dev` im Hauptordner, die drei Umgebungsvariablen in einer `.env` hinterlegen (nicht ins Repo hochladen).
