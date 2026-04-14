/**
 * offers.js
 *
 * Multi-step scene: request location → browse offers → select → pay → activate contract.
 * Patent ref: Claims 1, 2, 8 — location-aware offer routing, subscriber selection,
 * smart contract formation, and payment via cryptocurrency.
 */

const { Scenes, Markup } = require('telegraf');
const { getOffersForSubscriber, getOfferById, formatOffer } = require('../services/offerService');
const { createPaymentRequest, confirmPayment } = require('../services/walletService');
const { createContract, formatContract } = require('../services/contractService');
const { getCityFromCoords } = require('../services/locationService');

const offersScene = new Scenes.BaseScene('offers');

// ── Step 1: Request location ───────────────────────────────────────────────────

offersScene.enter((ctx) => {
  ctx.reply(
    '📍 To show you the best available plans, blocfone® needs your current location.',
    Markup.keyboard([
      [Markup.button.locationRequest('📍 Share my location')],
      ['❌ Cancel'],
    ]).resize().oneTime()
  );
});

// ── Step 2: Receive location and show offers ───────────────────────────────────

offersScene.on('location', async (ctx) => {
  const { latitude, longitude } = ctx.message.location;

  // Store coords in session for offer matching
  ctx.session.location = { latitude, longitude };

  // Resolve city name
  const city = await getCityFromCoords(latitude, longitude);
  ctx.session.city = city;

  const subscriberId = String(ctx.from.id);
  const offers = getOffersForSubscriber(subscriberId);

  const lines = offers.map((o, i) => formatOffer(o, i + 1)).join('\n\n');
  const buttons = offers.map((o, i) =>
    Markup.button.callback(`${i + 1}. ${o.provider}`, `select_${o.id}`)
  );

  await ctx.reply(
    'Got it — searching for plans near you...',
    Markup.removeKeyboard()
  );

  ctx.replyWithMarkdown(
    `📡 *Here are the best offers where you are now in ${city}*\n\n${lines}\n\nTap a plan to select it, or /start to go back.`,
    Markup.inlineKeyboard(buttons, { columns: 1 })
  );
});

// ── Cancel from keyboard ───────────────────────────────────────────────────────

offersScene.hears('❌ Cancel', (ctx) => {
  ctx.reply('Cancelled.', Markup.removeKeyboard());
  ctx.scene.leave();
});

// ── Step 3: Subscriber selects an offer ───────────────────────────────────────

offersScene.action(/^select_(.+)$/, (ctx) => {
  const offerId = ctx.match[1];
  const offer = getOfferById(offerId);

  if (!offer) {
    ctx.reply('Sorry, that offer is no longer available. Type /offers to refresh.');
    return ctx.scene.leave();
  }

  ctx.session.selectedOffer = offer;

  const payment = createPaymentRequest(offer);
  ctx.session.paymentRequest = payment;

  ctx.replyWithMarkdown(
    `✅ You selected *${offer.provider} — ${offer.data}*\n\n` +
    `To activate your contract, send:\n\n` +
    `💰 *${payment.amount} ${payment.currency}*\n` +
    `📬 To address: \`${payment.address}\`\n` +
    `⏱ Expires in: ${payment.expiresIn}\n\n` +
    `_(In this demo, tap Confirm to simulate payment)_`,
    Markup.inlineKeyboard([
      Markup.button.callback('✅ Confirm Payment (Demo)', 'confirm_payment'),
      Markup.button.callback('❌ Cancel', 'cancel'),
    ])
  );
});

// ── Step 4: Confirm payment and activate contract ──────────────────────────────

offersScene.action('confirm_payment', (ctx) => {
  const subscriberId = String(ctx.from.id);
  const offer = ctx.session.selectedOffer;
  const paymentRequest = ctx.session.paymentRequest;

  if (!offer || !paymentRequest) {
    ctx.reply('Session expired. Please type /offers to start again.');
    return ctx.scene.leave();
  }

  const payment = confirmPayment(paymentRequest.address);
  const contract = createContract(subscriberId, offer, payment);

  ctx.replyWithMarkdown(
    `🎉 *Contract Activated!*\n\n` +
    formatContract(contract) +
    `\n\nYour mobile service is now active. Use /status to view your contract at any time.`
  );

  delete ctx.session.selectedOffer;
  delete ctx.session.paymentRequest;

  ctx.scene.leave();
});

offersScene.action('cancel', (ctx) => {
  ctx.reply('Cancelled. Type /offers any time to browse plans.');
  ctx.scene.leave();
});

module.exports = { offersScene };
