/**
 * offerService.js
 *
 * Mock implementation of the patent's core offer-routing logic.
 * Patent ref: Claim 1 — server receives offers from providers, routes
 * location-aware offers to the subscriber's device.
 *
 * SWAP: Replace getOffersForSubscriber() with a real API call to carrier
 * provider nodes when funded.
 */

const offers = require('../../data/mockOffers.json');

// Price multipliers relative to the monthly base rate
const PERIOD_MULTIPLIER = {
  '1 day':   1 / 30,
  '1 week':  7 / 30,
  '1 month': 1,
  '1 year':  12,
};

const PERIOD_LABEL = {
  '1 day':   'per day',
  '1 week':  'per week',
  '1 month': 'per month',
  '1 year':  'per year',
};

/**
 * Calculates the price for a given period from the monthly base rate.
 * @param {string|number} monthlyPrice
 * @param {string} period
 * @returns {string} price rounded to 2 decimal places
 */
function calculatePeriodPrice(monthlyPrice, period) {
  const multiplier = PERIOD_MULTIPLIER[period] ?? 1;
  return (parseFloat(monthlyPrice) * multiplier).toFixed(2);
}

/**
 * Returns a list of available offers for a subscriber.
 * In production this filters by the subscriber's location and device capability.
 * @param {string} subscriberId - Telegram user ID
 * @returns {Array} list of offer objects
 */
function getOffersForSubscriber(subscriberId) {
  // Mock: return all offers regardless of location
  // Production: query provider nodes filtered by subscriber GPS coords
  return offers;
}

/**
 * Returns a single offer by ID.
 * @param {string} offerId
 * @returns {Object|null}
 */
function getOfferById(offerId) {
  return offers.find((o) => o.id === offerId) || null;
}

/**
 * Formats an offer for display in Telegram.
 * @param {Object} offer
 * @param {number} index - display index (1-based)
 * @param {string} [localPrice] - pre-calculated local currency string e.g. "≈ €11.94"
 * @param {string} [period] - selected time period e.g. "1 month"
 * @returns {string}
 */
function formatOffer(offer, index, localPrice = '', period = '1 month') {
  const coverage = offer.coverage === 'nationwide' ? '🌐 Nationwide' : `📍 ${offer.coverage}`;
  const periodPrice = calculatePeriodPrice(offer.priceUSDT, period);
  const periodLabel = PERIOD_LABEL[period] || 'per month';
  const priceLocal = localPrice ? ` (${localPrice})` : '';
  const planLines = offer.line1
    ? `   ${offer.line1}\n   ${offer.line2}\n`
    : `   ${offer.data} data · ${offer.speed}\n`;
  return (
    `${index}. *${offer.provider}*\n` +
    planLines +
    `   ${coverage}\n` +
    `   🗓 Fixed price for: ${period}\n` +
    `   💰 ${periodPrice} USD₮ ${periodLabel}${priceLocal}\n` +
    `   ⭐ ${offer.stars} Telegram Stars\n` +
    `   SLA: ${offer.sla}`
  );
}

module.exports = { getOffersForSubscriber, getOfferById, formatOffer, calculatePeriodPrice };
