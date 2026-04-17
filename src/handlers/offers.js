/**
 * offers.js
 *
 * Multi-step scene: select period → request location → browse offers → select → pay → activate.
 * Patent ref: Claims 1, 2, 8 — location-aware offer routing, subscriber selection,
 * smart contract formation, and payment via cryptocurrency.
 */

const { Scenes, Markup } = require('telegraf');
const { getOffersForSubscriber, getOfferById, formatOffer, calculatePeriodPrice } = require('../services/offerService');
const { createPaymentRequest, confirmPayment } = require('../services/walletService');
const { createContract, formatContract } = require('../services/contractService');
const { getLocationInfo, getLocationInfoFromText, toLocalCurrency } = require('../services/locationService');
const { sendStartButton } = require('./start');
const { askEsimReady } = require('./esim');

const offersScene = new Scenes.BaseScene('offers');

// ── Step 1: Ask for time period ────────────────────────────────────────────────

offersScene.enter((ctx) => {
  ctx.replyWithMarkdown(
    `🗓 *What time period would you like the offers to be a fixed price?*`,
    Markup.inlineKeyboard([
      Markup.button.callback('1 Day',   'period_1 day'),
      Markup.button.callback('1 Week',  'period_1 week'),
      Markup.button.callback('1 Month', 'period_1 month'),
      Markup.button.callback('1 Year',  'period_1 year'),
    ], { columns: 2 })
  );
});

// ── Step 2: Store period and request location ──────────────────────────────────

offersScene.action(/^period_(.+)$/, (ctx) => {
  const period = ctx.match[1];
  ctx.session.period = period;

  ctx.reply(
    `📍 To show you the best available plans, blocfone® needs your service location.\n\nShare your location automatically or type it manually below.`,
    Markup.keyboard([
      [Markup.button.locationRequest('📍 Share my location')],
      ['✏️ Type my location'],
      ['❌ Cancel'],
    ]).resize().oneTime()
  );
});

// ── Cancel — MUST be registered before on('text') ─────────────────────────────

offersScene.hears('❌ Cancel', (ctx) => {
  ctx.session.awaitingTypedLocation = false;
  ctx.scene.leave();
  sendStartButton(ctx);
});

// ── Step 2a: User taps Type my location ───────────────────────────────────────

offersScene.hears('✏️ Type my location', (ctx) => {
  ctx.session.awaitingTypedLocation = true;
  ctx.reply(
    'Please type your preferred service city, postcode, or zip code.',
    Markup.removeKeyboard()
  );
});

// ── Shared: show offers once location is resolved ─────────────────────────────

async function showOffers(ctx, city, currency) {
  const period = ctx.session.period || '1 month';
  ctx.session.city = city;
  ctx.session.currency = currency;

  const subscriberId = String(ctx.from.id);
  const offers = getOffersForSubscriber(subscriberId);

  const localPrices = await Promise.all(
    offers.map((o) => toLocalCurrency(calculatePeriodPrice(o.priceUSDT, period), currency))
  );

  const lines = offers.map((o, i) => formatOffer(o, i + 1, localPrices[i], period)).join('\n\n');
  const buttons = offers.map((o, i) =>
    Markup.button.callback(`${i + 1}. ${o.provider}`, `select_${o.id}`)
  );

  ctx.replyWithMarkdown(
    `📡 *Here are the best offers where you are now in ${city}*\n\n${lines}\n\nTap a plan to select it, or /start to go back.`,
    Markup.inlineKeyboard(buttons, { columns: 1 })
  );
}

// ── Step 3a: Receive GPS location ─────────────────────────────────────────────

offersScene.on('location', async (ctx) => {
  const { latitude, longitude } = ctx.message.location;
  ctx.session.location = { latitude, longitude };

  await ctx.reply('Got it — searching for plans near you...', Markup.removeKeyboard());

  const { city, currency } = await getLocationInfo(latitude, longitude);
  await showOffers(ctx, city, currency);
});

// ── Step 3b: Receive typed location ───────────────────────────────────────────
// Registered AFTER hears handlers so they take priority

offersScene.on('text', async (ctx, next) => {
  // Only handle text if we're awaiting a typed location or at the location step
  const atLocationStep = ctx.session.period && !ctx.session.city;
  if (!ctx.session.awaitingTypedLocation && !atLocationStep) return next();

  const query = ctx.message.text.trim();
  await ctx.reply(`Searching for "${query}"...`, Markup.removeKeyboard());

  const result = await getLocationInfoFromText(query);

  if (!result) {
    ctx.session.awaitingTypedLocation = true;
    return ctx.reply(
      `Sorry, we couldn't find that location. Please try again with a different city, postcode, or zip code.`
    );
  }

  ctx.session.awaitingTypedLocation = false;
  await showOffers(ctx, result.city, result.currency);
});

// ── Step 4: Subscriber selects an offer ───────────────────────────────────────

offersScene.action(/^select_(.+)$/, (ctx) => {
  const offerId = ctx.match[1];
  const offer = getOfferById(offerId);
  const period = ctx.session.period || '1 month';

  if (!offer) {
    ctx.reply('Sorry, that offer is no longer available. Type /offers to refresh.');
    return ctx.scene.leave();
  }

  ctx.session.selectedOffer = offer;

  const periodPrice = calculatePeriodPrice(offer.priceUSDT, period);
  const payment = createPaymentRequest(offer, periodPrice);
  ctx.session.paymentRequest = payment;

  const planSummary = offer.line1
    ? `${offer.line1} / ${offer.line2}`
    : `${offer.data} · ${offer.speed}`;

  ctx.replyWithMarkdown(
    `✅ You selected *${offer.provider} — ${planSummary}* for *${period}*\n\n` +
    `To activate your contract, send:\n\n` +
    `💰 *${payment.amount} USD₮*\n` +
    `📬 To address: \`${payment.address}\`\n` +
    `⏱ Expires in: ${payment.expiresIn}\n\n` +
    `_(In this demo, tap Confirm to simulate payment)_`,
    Markup.inlineKeyboard([
      Markup.button.callback('✅ Confirm Payment (Demo)', 'confirm_payment'),
      Markup.button.callback('❌ Cancel', 'cancel'),
    ])
  );
});

// ── Step 5: Confirm payment and activate contract ──────────────────────────────

offersScene.action('confirm_payment', async (ctx) => {
  const subscriberId = String(ctx.from.id);
  const offer = ctx.session.selectedOffer;
  const paymentRequest = ctx.session.paymentRequest;
  const period = ctx.session.period || '1 month';
  const currency = ctx.session.currency || { code: 'USD', symbol: '$' };

  if (!offer || !paymentRequest) {
    ctx.reply('Session expired. Please type /offers to start again.');
    return ctx.scene.leave();
  }

  const payment = confirmPayment(paymentRequest.address);
  payment.amount = paymentRequest.amount;

  const localPrice = await toLocalCurrency(payment.amount, currency);
  const contract = createContract(subscriberId, offer, payment, period, localPrice);

  await ctx.replyWithMarkdown(
    `🎉 *Contract Activated!*\n\n` +
    formatContract(contract) +
    `\n\n⭐ You have earned ${contract.stars} Telegram Stars!\n\n` +
    `Your mobile service is now active. Use /status to view your contract at any time.\n\n` +
    `[Remember, this is just a prototype/demo of a patent called blocfone®, you are not actually signing up for, nor paying for any mobile service.](https://blocfone.com)`
  );

  delete ctx.session.selectedOffer;
  delete ctx.session.paymentRequest;
  delete ctx.session.period;
  delete ctx.session.city;
  delete ctx.session.awaitingTypedLocation;

  ctx.scene.leave();
  askEsimReady(ctx);
});

offersScene.action('cancel', (ctx) => {
  ctx.scene.leave();
  sendStartButton(ctx);
});

module.exports = { offersScene };
