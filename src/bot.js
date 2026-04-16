require('dotenv').config();
const { Telegraf, session, Scenes, Markup } = require('telegraf');
const { onboardScene } = require('./handlers/onboard');
const { offersScene } = require('./handlers/offers');
const { showStatus } = require('./handlers/status');
const { sendStartScreen, sendStartButton } = require('./handlers/start');
const { askEsimReady, registerEsimHandlers } = require('./handlers/esim');

const bot = new Telegraf(process.env.BOT_TOKEN);

// Session middleware — stores subscriber state in memory (swap for Redis in production)
bot.use(session());

// Scene manager — handles multi-step conversation flows
const stage = new Scenes.Stage([onboardScene, offersScene]);
bot.use(stage.middleware());

// ── Commands ──────────────────────────────────────────────────────────────────

bot.start((ctx) => sendStartScreen(ctx));
bot.action('go_start', (ctx) => sendStartScreen(ctx));
bot.command('offers', (ctx) => ctx.scene.enter('offers'));
bot.command('status', showStatus);

bot.command('esim', (ctx) => askEsimReady(ctx));

bot.command('help', (ctx) => {
  ctx.reply(
    `ℹ️ How blocfone® works\n\n` +
    `1. Browse competing mobile service offers from multiple carriers\n` +
    `2. Select a plan — price, speed, and coverage are shown upfront\n` +
    `3. Confirm with crypto — a smart contract locks in the terms\n` +
    `4. The contract monitors performance automatically\n` +
    `5. If the carrier underperforms, the contract enforces penalties\n\n` +
    `Built on US Patent 10,915,873 B2 | EU Patent EP3542333A1`
  );
  ctx.reply(
    'Tap the button below to go back to the start.',
    Markup.inlineKeyboard([Markup.button.callback('▶  Start', 'go_start')])
  );
});

registerEsimHandlers(bot);

// ── Launch ─────────────────────────────────────────────────────────────────────

bot.launch(() => {
  console.log('blocfone® bot is running...');
});

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
