# 🌟 Smartschool++, Geef Smartschool een upgrade

Verbeter en personaliseer je Smartschool-ervaring met thema's, widgets, games en meer.

# 📌 Overzicht

Smartschool++ is een Chrome-extensie die het Belgische leerplatform Smartschool uitbreidt met diverse visuele en functionele verbeteringen.
Ontwikkeld door [drie middelbare scholieren met hulp van vrijwilligers](https://github.com/sprksoft/smpp/graphs/contributors), biedt deze extensie een reeks aanpassingsmogelijkheden om de gebruikerservaring te verrijken.

# 🎯 Belangrijkste functies

✅ Thema’s – Kies uit 15 unieke thema’s om de interface van Smartschool aan te passen.

❄️ Weereffecten – Voeg sneeuw- of regenanimaties toe voor een dynamische achtergrond.

🌱 Virtuele plant – Zorg voor een digitale plant op je dashboard die dagelijks aandacht nodig heeft.

🗓️ Planner-widget – Bekijk je agenda direct op de startpagina.

🚌 De Lijn-integratie – Ontdek buslijnen en haltes rechtstreeks op je dashboard.

🎮 Ingebouwde games – Speel klassieke spellen zoals Flappy Bird++ en Snake++.

⚡ Snelmenu – Navigeer efficiënt door Smartschool met het : toets snelmenu.

🖼️ Achtergrondaanpassing – Stel een eigen afbeelding of link in als achtergrond.

💬 Global Chat – Communiceer met andere gebruikers via de ingebouwde chatfunctie.

# 🚀 Installatie

Installeer de extentie op de [Chrome web store](https://chromewebstore.google.com/detail/bdhficnphioomdjhdfbhdepjgggekodf)

Klik op "Toevoegen aan Chrome".

Open Smartschool en klik op "Settings" rechtsboven om de extensie aan te passen.

# 👥 Community & Ondersteuning

Voor vragen of feedback, sluit je aan bij onze [Discord server](https://discord.gg/A77xPC9qdW
).

# 👨‍💻 Voor Developers

Wil je een pull request maken of helpen?
Gebruik Bun en Biome zodat formatting en linting consistent blijven.

## Lokale setup

1. Installeer [Bun](https://bun.sh/docs/installation).
2. Installeer dependencies:
   - `bun install`
3. Build de extensie:
   - `bun run build`
4. Laad de extensie als "Load unpacked" van `extension/` in Chrome.

## Snelle Windows test

Gebruik `test-extension-windows.bat` in de projectroot.

Dit script doet automatisch:
- `bun install --frozen-lockfile`
- `bun run ci` (Biome check)
- `bun run build`

## Pre-commit checks

Husky draait een pre-commit hook (`.husky/pre-commit`) die `bun run ci` uitvoert.
Na `bun install` wordt Husky automatisch geactiveerd via de `prepare` script in `package.json`.
