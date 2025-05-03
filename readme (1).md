# KreativPoster

KreativPoster er en moderne plattform for håndtering av sosiale medier, designet for å forenkle publisering og administrasjon av innhold på tvers av flere plattformer som Facebook, Instagram, TikTok, YouTube og Snapchat.

## Hovedfunksjoner

- **Vindusbasert plattformintegrasjon:** Koble til sosiale medier via popup-vinduer uten behov for kompliserte API-integrasjoner
- **Publisering på flere plattformer:** Opprett og publiser innhold til flere sosiale nettverk samtidig
- **Planlegging av innlegg:** Planlegg innlegg for fremtidig publisering
- **Offline-funksjonalitet:** Fortsett å jobbe selv uten internettforbindelse
- **Responsivt grensesnitt:** Fungerer på både desktop og mobile enheter
- **AI-generert innholdsforslag:** Få hjelp til å lage engasjerende innhold

## Teknisk oversikt

KreativPoster er bygget med følgende teknologier:

- **React:** Frontend rammeverk
- **TailwindCSS:** Utility-first CSS-rammeverk
- **IndexedDB:** For lokal datalagring og offline-støtte
- **Service Workers:** For bakgrunnssynkronisering og caching

## Kom i gang

### Forutsetninger

- Node.js (v14 eller nyere)
- npm (v7 eller nyere)

### Installasjon

1. Klon repositoriet:
   ```bash
   git clone https://github.com/ditt-brukernavn/kreativposter.git
   cd kreativposter
   ```

2. Installer avhengigheter:
   ```bash
   npm install
   ```

3. Start utviklingsserveren:
   ```bash
   npm start
   ```

4. Åpne nettleseren på [http://localhost:3000](http://localhost:3000)

### Bygging for produksjon

```bash
npm run build
```

Bygde filer vil bli generert i `build`-mappen.

## Filstruktur

```
kreativposter/
├── public/              # Statiske filer
├── src/                 # Kildekode
│   ├── components/      # React komponenter
│   ├── services/        # Tjenester for bakgrunnsprosesser
│   ├── utils/           # Hjelpefunksjoner
│   ├── App.js           # Hovedapp-komponent
│   └── index.js         # Applikasjonens startpunkt
└── scripts/             # Bygge- og hjelpeskript
```

## Konfigurasjon

Ingen API-nøkler eller spesielle konfigurasjoner er nødvendig da appen bruker en vindusbasert tilnærming for autentisering. Brukeren logger direkte inn på plattformene via popup-vinduer.

## Test Dashboard

KreativPoster kommer med et innebygd test-dashboard som kan brukes til å verifisere at alle nødvendige funksjoner støttes i brukerens nettleser. Tilgjengelig på `/test` ruten.

## Bidragsytelse

Bidrag til KreativPoster er velkomne! Vennligst følg disse trinnene:

1. Fork repositoriet
2. Opprett en ny branch: `git checkout -b min-nye-funksjon`
3. Gjør dine endringer
4. Commit endringene: `git commit -m 'Legg til min-nye-funksjon'`
5. Push til branchen: `git push origin min-nye-funksjon`
6. Send en pull request

## Lisens

Dette prosjektet er lisensiert under [MIT lisensen](LICENSE).

## Forfatter

- Ditt navn
- Kontakt: [din.epost@example.com](mailto:din.epost@example.com)
