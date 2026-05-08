# TradeView

TradeView is a full-stack trading dashboard built with Next.js. It combines market discovery, watchlists, alerts, charting, paper-trading style order flows, portfolio/holdings views, wallet workflows, and payment-provider integrations in one responsive web application.

> Live deployment: <https://trading-website-two.vercel.app/>

## Features

- **Authentication** with NextAuth, OAuth providers, and email/password account creation.
- **Market dashboards** for stocks and crypto with quotes, charts, news, and company financial reports.
- **Trading workspace** with symbol-specific trade pages, order placement, order history, and order confirmation flows.
- **Watchlists and alerts** for tracking symbols and managing alert state.
- **Portfolio and holdings** screens with allocation charts, day-change metrics, holdings tables, and performance summaries.
- **Wallet workflows** for balances, transactions, add-money flows, withdrawals, and wallet password checks.
- **Payment integrations** for Razorpay, PayU, and Cashfree, configured entirely through environment variables.
- **Responsive UI** using Tailwind CSS, Radix/shadcn-style primitives, and reusable components.

## Tech Stack

- **Framework:** Next.js 16 App Router
- **Language:** TypeScript / React 19
- **Styling:** Tailwind CSS, shadcn-style UI components, Framer Motion/Motion
- **Authentication:** NextAuth
- **Database:** MongoDB with Mongoose
- **Cache:** Redis
- **Charts/data visualization:** Recharts, Chart.js, lightweight-charts, React Konva
- **Market/news APIs:** Finnhub, Polygon, RapidAPI/Yahoo Finance, crypto/news endpoints
- **Payments:** Razorpay, PayU, Cashfree
- **Package manager:** npm (`package-lock.json` is committed)

## Requirements

- Node.js 24.x is recommended to match the current dependency constraints.
- npm 10+.
- MongoDB database connection string.
- Redis connection string if using cached market/holdings endpoints.
- API/provider credentials for the integrations you enable.

## Installation

```bash
git clone <your-repository-url>
cd trading-website
npm install
cp .env.example .env.local
```

Fill in `.env.local` with your local credentials. Do **not** commit `.env.local` or any other secret-bearing `.env` file.

## Environment Variables

See [`.env.example`](./.env.example) for the complete template. Important groups include:

| Group | Variables |
| --- | --- |
| App/Auth | `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GITHUB_ID`, `GITHUB_SECRET` |
| Database/Cache | `MONGODB_URI`, `REDIS_URL` |
| Market data | `FINNHUB_API_KEY`, `NEXT_PUBLIC_FINNHUB_API_KEY`, `NEXT_PUBLIC_POLYGON_API_KEY`, `NEXT_PUBLIC_RAPIDAPI_KEY`, `NEXT_PUBLIC_NEWS_API_KEY` |
| Razorpay | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAYX_ACCOUNT`, `NEXT_PUBLIC_RAZORPAY_KEY_ID` |
| PayU | `PAYU_MERCHANT_KEY`, `PAYU_SALT`, `PAYU_BASE_URL`, `NEXT_PUBLIC_PAYU_MERCHANT_KEY`, `NEXT_PUBLIC_PAYU_BASE_URL` |
| Cashfree | `CASHFREE_CLIENT_ID`, `CASHFREE_CLIENT_SECRET` |
| Notifications | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` |

Only variables prefixed with `NEXT_PUBLIC_` are safe to expose to the browser. Keep all server-side keys and secrets unprefixed.

## Development Commands

```bash
npm run dev          # Start the local Next.js dev server
npm run lint         # Run the repository quality gate (TypeScript check)
npm run type-check   # Run TypeScript without emitting files
npm run build        # Create a production Next.js build
npm run start        # Start the production server after building
```

## Project Structure

```text
app/                 Next.js App Router pages, layouts, and API routes
components/          Reusable UI, trading, wallet, watchlist, crypto, and dashboard components
contexts/            Client-side providers for auth, market data, wallet, orders, alerts, etc.
hooks/               Shared React hooks
lib/                 Database, API clients, auth, payment helpers, cache, and utilities
public/              Static images and icons
styles/              Additional global styles
types/               Shared TypeScript declarations and domain types
```

## Deployment Notes

1. Configure all required environment variables in your hosting provider before building.
2. Keep server-only payment/database/API secrets out of `next.config.mjs`; Next.js can expose config `env` values to client bundles.
3. Ensure MongoDB and Redis are reachable from the deployment environment.
4. Configure OAuth callback URLs for your deployed domain.
5. Configure payment-provider callback/webhook URLs for the deployed domain.
6. Run `npm run lint`, `npm run type-check`, and `npm run build` before pushing or deploying.

## Security Notes

- `.env*` files are ignored by git; commit only `.env.example`.
- Never add real API keys, payment secrets, OAuth secrets, database URLs, or Redis credentials to source control.
- Client-side code should only read `NEXT_PUBLIC_*` variables.
- Payment and database clients are initialized lazily so production builds do not require live secrets at import time.

## License

This project is currently marked private. Add a license file before publishing if you intend to distribute it publicly.

## Author

Gireesh Kasa
