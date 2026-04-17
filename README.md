# blocfone® Demo

Telegram-based demo of the blocfone® decentralised mobile marketplace.

**US Patent 10,915,873 B2 | EU Patent EP3542333A1**

---

## What it does

A Telegram bot that walks a subscriber through the full patent flow:

1. Select a fixed-price period (1 Day / 1 Week / 1 Month / 1 Year)
2. Share GPS location or type a preferred service country and city
3. Browse competing carrier offers — pricing auto-adjusted for the selected period and shown in local currency
4. Select a plan
5. Confirm USDT crypto payment (simulated in demo)
6. Smart contract activates — terms locked with a mock on-chain transaction
7. Earn Telegram Stars as a loyalty reward
8. Set up eSIM (simulated walkthrough)
9. View active contract at any time via /status

---

## Bot commands

| Command | Description |
|---------|-------------|
| `/start` | Welcome screen |
| `/offers` | Start the full browse → select → pay → activate flow |
| `/status` | View your active contract |
| `/esim` | Re-open eSIM setup if deferred |
| `/help` | How blocfone® works |

---

## Demo flow in detail

**Step 1 — Period selection**
User selects a fixed-price period. All offer prices are calculated from the monthly base rate using period multipliers (e.g. 1 week = 7/30 of monthly price).

**Step 2 — Location**
On mobile: tap "Share my location" for automatic GPS detection via OpenStreetMap Nominatim.
On desktop: tap "Type service location/country" and type a country and city.

**Step 3 — Offers**
Three competing carrier plans are shown with:
- Plan details (voice, data, speed)
- Coverage (nationwide or urban)
- Period-adjusted price in USDT
- Equivalent price in local currency (via live exchange rates from open.er-api.com)
- Telegram Stars loyalty reward
- SLA guarantee

**Step 4 — Select & Pay**
User selects a plan. A mock USDT payment address and amount are generated. User taps Confirm to simulate payment.

**Step 5 — Contract Activated**
A mock smart contract is created and displayed showing provider, location, plan, price, SLA, status, activation date, renewal date, and transaction hash.

**Step 6 — eSIM Setup**
User is asked if they want to set up their eSIM immediately. If yes, they choose to keep their current number or get a new local number, then follow a 7-step eSIM installation guide.

---

## Setup

### 1. Get a Telegram Bot Token

Open Telegram → search **@BotFather** → `/newbot` → follow prompts → copy the token.

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and paste your bot token:

```
BOT_TOKEN=your_token_here
```

### 4. Run locally

```bash
npm run dev
```

Open Telegram, find your bot, and send `/start`.

---

## Deploy to Railway

1. Push this repo to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Select this repo
4. Add environment variable: `BOT_TOKEN=your_token_here`
5. Deploy — Railway runs `npm start` automatically

The bot is live within ~60 seconds of every push to GitHub.

To deploy any change:
```bash
git add .
git commit -m "describe your change"
git push
```

---

## Project structure

```
src/
  bot.js                  # Entry point — command and action routing
  handlers/
    offers.js             # Full flow: period → location → browse → pay → activate
    esim.js               # eSIM setup simulation
    start.js              # Welcome screen and Start button helpers
    status.js             # /status command
  services/
    offerService.js       # Offer routing and formatting (mock → real carrier API)
    walletService.js      # Crypto payment simulation (mock → BTCPay/Lightning)
    contractService.js    # Smart contract lifecycle (mock → Solidity)
    locationService.js    # GPS + text geocoding, local currency conversion
data/
  mockOffers.json         # Three seed carrier offers for demo
```

Every service module has a clearly marked `SWAP:` comment showing what replaces the mock in production.

---

## Patent reference

This demo illustrates the core claims of:

- **US Patent 10,915,873 B2** — granted
- **EU Patent EP3542333A1** — intention to grant March 16, 2026

Key claims demonstrated: location-aware offer routing (Claim 1), subscriber selection and smart contract formation (Claims 1, 2, 8), cryptocurrency payment and escrow (Claims 4–6), performance enforcement (Claim 8).

---

*This is a prototype/demo only. No real mobile service is being purchased or activated.*
