/**
 * offers.js
 *
 * Multi-step scene: browse offers → select one → confirm payment → activate contract.
 * Patent ref: Claims 1, 2, 8 — offer routing, subscriber selection,
 * smart contract formation, and payment via cryptocurrency.
 */

const { Scenes, Markup } = require('telegraf');
const { getOffersForSubscriber, getOfferById, formatOffer } = require('../services/offerService');
const { createPaymentRequest, confirmPayment } = require('../services/walletService');
const { createContract, formatContract } = require('../services/contractService');

const offersScene = new Scenes.BaseScene('offers');

// ── Step 1: Show available offers ─────────────────────────────────────────────

offersScene.enter((ctx) => {
  const subscriberId = String(ctx.from.id);
  const offers = getOffersForSubscriber(subscriberId);

  const lines = offers.map((o, i) => formatOffer(o, i + 1)).join('\n\n');
  const buttons = offers.map((o, i) =>
    Markup.button.callback(`${i + 1}. ${o.provider}`, `select_${o.id}`)
  );

  ctx.replyWithMarkdown(
    `📡 *Available Plans*\n\nHere are the competing offers for your area:\n\n${lines}\n\nTap a plan to select it, or /start to go back.`,
    Markup.inlineKeyboard(buttons, { columns: 1 })
  );
});

// ── Step 2: Subscriber selects an offer ──────────────────────────────────────

offersScene.action(/^select_(.+)$/, (ctx) => {
  const offerId = ctx.match[1];
  const offer = getOfferById(offerId);

  if (!offer) {
    ctx.reply('Sorry, that offer is no longer available. Type /offers to refresh.');
    return ctx.scene.leave();
  }

  // Store selection in session
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

// ── Step 3: Confirm payment and activate contract ─────────────────────────────

offersScene.action('confirm_payment', (ctx) => {
  const subscriberId = String(ctx.from.id);
  const offer = ctx.session.selectedOffer;
  const paymentRequest = ctx.session.paymentRequest;

  if (!offer || !paymentRequest) {
    ctx.reply('Session expired. Please type /offers to start again.');
    return ctx.scene.leave();
  }

  // Simulate payment confirmation
  const payment = confirmPayment(paymentRequest.address);

  // Create smart contract record
  const contract = createContract(subscriberId, offer, payment);

  ctx.replyWithMarkdown(
    `🎉 *Contract Activated!*\n\n` +
    formatContract(contract) +
    `\n\nYour mobile service is now active. Use /status to view your contract at any time.`
  );

  // Clean up session
  delete ctx.session.selectedOffer;
  delete ctx.session.paymentRequest;

  ctx.scene.leave();
});

offersScene.action('cancel', (ctx) => {
  ctx.reply('Cancelled. Type /offers any time to browse plans.');
  ctx.scene.leave();
});

module.exports = { offersScene };
