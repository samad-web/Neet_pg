# Ardent MDS — NEET PG Predictor

Calibrated probability deck for NEET PG admission. Vite + React frontend, Express API backend.

## Stack
- **Frontend:** Vite + React 18 (ES modules, no Babel-in-browser, no UMD).
- **Backend:** Express server exposing `/api/colleges`, `/api/sample-data`, `/api/predict`, `/api/backtest`.
- **Shared lib:** `src/lib/{colleges,sampleData,algo}.js` — used by both client and server.

## Run

```
npm install
npm run dev
```

- Vite dev server: http://localhost:5173 (proxies `/api` → 8787)
- API server:      http://localhost:8787

## Build & serve

```
npm run build       # outputs to ./dist
npm start           # Express serves /dist + /api
```

## API

| Method | Path                       | Purpose                                              |
|--------|----------------------------|------------------------------------------------------|
| GET    | `/api/health`              | Liveness / version                                   |
| GET    | `/api/colleges`            | Bundled NMC PG master list + states/types/specialties |
| GET    | `/api/sample-data`         | Deterministic synthetic historical allotment rows     |
| GET    | `/api/sample-template.csv` | Upload template                                       |
| POST   | `/api/predict`             | `{ student, records }` → predictions                  |
| POST   | `/api/backtest`            | `{ records }` → hold-out calibration table            |

## Admin

Slide-over panel accessible from any route. Demo credentials:

- Username: any (e.g. `admin`)
- Password: `ardent2026`

Session-only — sign out, refresh, or close the tab to clear.

## Algorithm

Per the design spec, for each `(college, course)`:

1. Build eligible pools from `(category, quota, PwBD, in-service, domicile)`.
2. For each pool, compute year-by-year **closing rank** = 95th percentile of allotted ranks.
3. Forecast next-year closing via weighted least-squares slope, capped at ±25%.
4. `forecastSE = max(σ, 0.10 · forecastValue)`.
5. Per-pool probability `pᵢ = Φ((forecast − R) / SE)`; combine via `P = 1 − ∏(1 − pᵢ)`.
6. Tier: Safe ≥ 0.85, Likely ≥ 0.65, Target ≥ 0.40, Reach ≥ 0.15, Unlikely otherwise.

Religion is a flag for minority-institution eligibility only — never a probability multiplier. Gender, age, and MBBS college of origin are excluded.
