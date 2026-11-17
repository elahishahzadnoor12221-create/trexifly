# Trexifly

A travel aggregator and metasearch front end: an interactive 3D globe hero, a
glassmorphism four-tab search engine (flights, hotels, car rentals, tours), a
live price-comparison results view with filters, and an affiliate-ready deal
card structure.

```sh
bun install
bun run dev        # http://localhost:5363
bun run typecheck
bun run build
```

## Where things live

| What | File |
| --- | --- |
| Design tokens, glass utilities, 3D globe and tilt CSS | `src/styles.css` |
| Destinations, providers, query model and the deal generator | `src/lib/data.ts` |
| Affiliate URL builder (drop your programme IDs here) | `src/lib/affiliates.ts` |
| Currency + language preferences | `src/lib/prefs.tsx` |
| Header, mobile tab bar, footer, currency/language switcher | `src/components/Chrome.tsx` |
| CSS 3D globe and topographic background | `src/components/Globe.tsx` |
| Four-tab search widget | `src/components/SearchWidget.tsx` |
| Tilt-card destination carousel and SVG artwork | `src/components/Destinations.tsx`, `DestinationArt.tsx` |
| Comparison cards, filters, affiliate slots | `src/components/DealCard.tsx`, `AffiliateWidgetSlot.tsx`, `src/pages/Results.tsx` |
| Worker routes | `src/worker/index.ts` |

## Routes

`/` hero, search widget, partner strip, featured destinations.
`/results?type=flights|hotels|cars|tours&...` provider comparison, filters, booking section.

## Affiliate integration

Every "View Deal" button uses `buildAffiliateUrl(provider, query)` and opens the
provider in a new tab with `rel="sponsored"`. Add your IDs to `AFFILIATE_IDS` in
`src/lib/affiliates.ts` and the tracking parameter is appended to the deep link.

White-label widgets (Travelpayouts and friends) mount inside
`<AffiliateWidgetSlot id="..." />`. Frames already exist at `results-rail`,
`results-inline`, `results-booking` and `home-partner-band`, each exposing
`data-affiliate-slot` / `data-affiliate-variant` for script targeting, and each
keeps its height so nothing shifts when a widget loads.

## Notes

Prices come from a deterministic generator seeded by the search, so results are
stable per query but not real. Swap `dealsFor` in `src/lib/data.ts` for a
metasearch API when you have one.
