# chuchipirat

Der chuchipirat ist eine Web-Applikation, die Freiwillige in Jugendverbänden in der Planung, Durchführung und Nachbearbeitung von Lagerküchen unterstützt. Das Kochen in grossen Mengen in einem Lager oder Kurs ist gerade in der Vorbereitung aufwendig und erfordert spezifische Kenntnisse, damit nicht nur schmackhaftes, sondern auch Essen in passender Menge serviert werden kann. Genau hier unterstützt dich der chuchipirat. Lege einen Anlass an, wähle aus den bestehenden Rezepten (oder lege ein neues an) und plane dieses ein. Definiere für wie viele Portionen du zubereiten möchtest und überlasse die Skalierung dem chuchipirat. Kurz vor dem Anlass kannst du automatisiert die Einkaufsliste generieren oder die verwendeten Rezepte (in der richtigen Skalierung) ausdrucken. Wie du mit dem chuchipirat arbeiten kannst, ist im [Helpcenter](https://help.chuchipirat.ch/) beschrieben.

Willst du als Entwickler\*in am chuchipirat mitarbeiten? Hier findest du alle nötigen Informationen, um das Projekt bei dir zum Laufen zu bringen.

## Features

- Rezepte suchen und neue erstellen
- Skalieren von Rezepten auf die gewünschten Gruppengrösse
- Menüplan erstellen und Rezepte zuordnen
- Erstellen von Gruppen und deren Ernährungsform
- automatisches Erstellen einer Einkaufsliste anhand der geplanten Rezepte
- automatisches Erstellen einer Materialliste anhand der geplanten Rezepte
- automatische Neuberechnung der Portionen bei einer Anpassung der hinterlegten Gruppe
- Export des Menüplans, der Rezepte und der Listen als PDF (offline-Fall)

## Technologie-Stack

- **Frontend**: [React](https://react.dev/), [Material UI](https://mui.com/)
- **Backend**: [Node.js](https://nodejs.org/en)
- **Datenbank**: [Firebase](https://firebase.google.com/)
- **Build-Tools**: [z. B.: Webpack, Babel]
- **Test-Frameworks**: [Jest](https://jestjs.io/)
- **Bug-Monitor**: [Sentry](https://sentry.io)

# Projektdokumentation

## Projektstruktur

```
├── public/               # Statische Dateien wie index.html
├── src/                  # Quellcode des Projekts
│   ├── components/       # Wiederverwendbare React-Komponenten
│   ├── pages/            # Seitenkomponenten
│   ├── services/         # API-Aufrufe und externe Verbindungen
│   ├── styles/           # CSS oder Tailwind-Konfiguration
│   ├── utils/            # Hilfsfunktionen und Services
│   └── App.js            # Haupteinstiegspunkt der Anwendung
├── tests/                # Testfälle und Test-Suiten
├── .env                  # Umgebungsvariablen (nicht in das Repo hochladen)
├── package.json          # NPM-Abhängigkeiten und Skripte └── README.md
```

## Installation

### Voraussetzungen

Stelle sicher, dass folgende Software auf deinem Rechner installiert ist:

- **Node.js**: Version >= 14.x.x
- **npm**: Version >= 6.x.x

## Firebase-Datenbank

Lege dir eine Firebase-Datenbank an. Die Struktur und Sicherheitsregeln der Datenbank findest du unter [[Firebase-Datenstruktur]] und [[Firebase-Securityrules]].

## .env Datei

Um das Projekt lokal auszuführen, musst du eine `.env`-Datei mit den Umgebungsvariablen erstellen. Beispiel:

```bash
REACT_APP_API_URL=http://localhost:5000 MONGO_URI=mongodb://localhost:27017/chuchipirat PORT=3000
```

## Cloud-Functions

> [!Info]
> Bitte beachte, dass es neben diesem Repository auch einige Cloud-Functions gibt, welche gewisse Prozesse/Manipulationen auf der Cloud direkt ausführen. Dieser Code ist in einem privaten Repository.

## Mitwirken

Wir freuen uns über jede Art von Mitwirkung! Um mitzumachen, folge bitte diesen Schritten:

1. Forke das Repository.
2. Erstelle einen neuen Branch (`git checkout -b feature-xy`).
3. Führe deine Änderungen durch und commite sie (`git commit -am 'Neue Funktionalität'`).
4. Schreibe oder ändere die entprechenden Tests.
5. Pushe auf den Branch (`git push origin feature-xy`).
6. Stelle einen Pull-Request.

## Tests ausführen

Um die Tests auszuführen, kannst du folgendes Kommando nutzen:

```bash
npm run test
```

Das Test-Framework führt dann alle definierten Tests in der Datei `tests/` aus.

## Genutzte Pakete

Vielen Dank für die grossartige Software:

- [Fuse.js](https://www.fusejs.io/) - Fuzzy-Search
- [Sentry](https://sentry.io) - automatisches überwachen von Fehlern

## License

Dieses Projekt ist lizenziert unter der GNU Affero General Public License v3.0.  
Du findest den vollständigen Lizenztext in der Datei [LICENSE](./LICENSE).
