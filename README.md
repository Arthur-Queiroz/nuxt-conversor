# conversor-nuxt

A real-time currency converter built with Nuxt 3. Fetches live exchange rates from AwesomeAPI and lets you convert between 7 currencies instantly.

## Features

- **Live conversion** — rates auto-refresh every 30 seconds
- **7 currencies** — BRL, USD, EUR, GBP, ARS, JPY, PYG with country flags
- **Rates table** — dedicated `/cotacoes` page with buy/sell/high/low and % change
- **Base selector** — compare all currencies against BRL or USD
- **PT / EN** — bilingual UI, preference persisted in localStorage
- **No dependencies** — zero third-party UI libraries or i18n packages

## Stack

| Layer | Choice |
|---|---|
| Framework | Nuxt 4 (Nuxt 3 compat) |
| Language | TypeScript |
| Rates API | [AwesomeAPI](https://docs.awesomeapi.com.br) |
| Fonts | Instrument Serif · Geist · Caveat (Google Fonts) |
| Flags | flagcdn.com |

## Getting started

```bash
npm install
npm run dev       # http://localhost:3000
```

```bash
npm run build     # production build
npm run preview   # preview production build locally
```

## Project structure

```
app/
├── pages/
│   ├── index.vue          # converter + how it works + about
│   └── cotacoes.vue       # live rates table
├── components/
│   └── TheNav.vue         # shared navigation
├── composables/
│   └── useLocale.ts       # lightweight i18n (no library)
├── locales/
│   ├── pt.json
│   └── en.json
└── assets/css/
    └── conversor.css

server/
├── api/
│   └── rates.get.ts       # Nuxt server route
└── utils/
    └── awesomeapi.ts      # API client + normalizer

public/
└── flags/
    └── eu.svg
```

## How rates work

The server route (`/api/rates`) fetches from AwesomeAPI and normalizes everything to **"how many BRL per 1 unit of foreign currency"**. The frontend does cross-rate math on the client:

```
USD → EUR rate = EUR_bid / USD_bid
```

When base is USD, BRL's high/low are inverted (`1 / usd.low` → BRL high) and pctChange is negated.

## License

MIT
