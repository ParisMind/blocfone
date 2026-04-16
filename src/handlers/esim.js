/**
 * esim.js
 *
 * eSIM setup simulation — triggered after contract activation.
 * Walks the subscriber through standard eSIM installation steps.
 */

const { Markup } = require('telegraf');
const { showStatus } = require('./status');

/**
 * Asks the subscriber if they are ready to set up their eSIM.
 * Called immediately after contract activation.
 */
function askEsimReady(ctx) {
  return ctx.reply(
    '📲 Are you ready to setup your new eSIM?',
    Markup.inlineKeyboard([
      Markup.button.callback('✅ Yes', 'esim_yes'),
      Markup.button.callback('🕐 Not Now', 'esim_not_now'),
    ])
  );
}

/**
 * Sends the full eSIM installation instructions.
 */
function sendEsimInstructions(ctx) {
  return ctx.replyWithMarkdown(
    `📲 *eSIM Installation Instructions*\n\n` +
    `Follow these steps to activate your blocfone® eSIM:\n\n` +
    `*Step 1 — Open Settings*\n` +
    `On your phone, go to *Settings*.\n\n` +
    `*Step 2 — Go to Mobile / Cellular*\n` +
    `Tap *Mobile Data* (iOS) or *Connections → SIM Manager* (Android).\n\n` +
    `*Step 3 — Add eSIM*\n` +
    `Tap *Add eSIM* or *Add Mobile Plan*.\n\n` +
    `*Step 4 — Scan your QR code*\n` +
    `Select *Use QR Code* and scan the QR code sent to your registered email, or enter the activation code manually.\n\n` +
    `*Step 5 — Label your plan*\n` +
    `Give your new plan a label (e.g. "blocfone®") and tap *Done*.\n\n` +
    `*Step 6 — Set as active line*\n` +
    `When prompted, choose whether to use this as your primary or secondary line for calls, texts, and data.\n\n` +
    `*Step 7 — Wait for activation*\n` +
    `Activation typically takes 1–2 minutes. You will see the carrier name appear in your status bar when complete.\n\n` +
    `Once your eSIM is active, tap the button below.`,
    Markup.inlineKeyboard([
      Markup.button.callback("✅ I've done this", 'esim_done'),
    ])
  );
}

/**
 * Asks whether the subscriber wants to keep their number or get a new local one.
 */
function askNumberPreference(ctx) {
  const city = ctx.session.city || 'your area';
  return ctx.reply(
    `Do you wish to bring your current phone number with you, or would you like a new, local phone number in ${city}?`,
    Markup.inlineKeyboard([
      Markup.button.callback('📲 Keep my current number', 'esim_keep_number'),
      Markup.button.callback(`🆕 New local number in ${city}`, 'esim_new_number'),
    ], { columns: 1 })
  );
}

/**
 * Registers all eSIM-related action handlers on the bot.
 * @param {Telegraf} bot
 */
function registerEsimHandlers(bot) {
  // User taps Yes — ask number preference first
  bot.action('esim_yes', (ctx) => {
    ctx.answerCbQuery();
    askNumberPreference(ctx);
  });

  // User wants to keep their number — note it and show instructions
  bot.action('esim_keep_number', (ctx) => {
    ctx.answerCbQuery();
    ctx.reply('Great — we\'ll port your existing number across.');
    sendEsimInstructions(ctx);
  });

  // User wants a new local number — note it and show instructions
  bot.action('esim_new_number', (ctx) => {
    ctx.answerCbQuery();
    const city = ctx.session.city || 'your area';
    ctx.reply(`Great — a new local ${city} number will be assigned to your eSIM.`);
    sendEsimInstructions(ctx);
  });

  // User taps Not Now — defer with /esim command hint
  bot.action('esim_not_now', (ctx) => {
    ctx.answerCbQuery();
    ctx.reply('Ok, tap /esim when you are ready.');
  });

  // User taps I've done this — show active contract
  bot.action('esim_done', (ctx) => {
    ctx.answerCbQuery();
    showStatus(ctx);
  });
}

module.exports = { askEsimReady, registerEsimHandlers };
