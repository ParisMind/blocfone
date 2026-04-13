# blocfone® Demo

Telegram-first demo of the blocfone® decentralised mobile marketplace.

**US Patent 10,915,873 B2 | EU Patent EP3542333A1**

---

## What it does

A Telegram bot that walks a subscriber through the core patent flow:

1. Browse competing carrier offers (location-aware in production)
2. Select a plan
3. Confirm crypto payment (simulated in demo)
4. Smart contract activates — terms locked on-chain
5. Check subscription status any time

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

The bot is live within ~30 seconds of every push.

---

## Project structure

```
src/
  bot.js                  # Entry point — command routing
  handlers/
    onboard.js            # /start scene
    offers.js             # Browse → select → pay → activate
    status.js             # /status command
  services/
    offerService.js       # Offer routing (mock → real carrier API)
    walletService.js      # Crypto payment (mock → BTCPay/Lightning)
    contractService.js    # Smart contract lifecycle (mock → Solidity)
data/
  mockOffers.json         # Seed offers for demo
```

Every service module has a clearly marked `SWAP:` comment indicating exactly what replaces the mock in production.

---

## Commands

| Command | Description |
|---------|-------------|
| `/start` | Welcome message |
| `/offers` | Browse and select a service plan |
| `/status` | View active contract |
| `/help` | How blocfone® works |
