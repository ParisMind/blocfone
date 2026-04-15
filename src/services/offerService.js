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
  const priceLocal = localPrice ? ` (${localPrice})` : '';
  return (
    `${index}. *${offer.provider}*\n` +
    `   ${offer.data} data · ${offer.speed}\n` +
    `   ${coverage}\n` +
    `   🗓 Fixed price for: ${period}\n` +
    `   💰 ${offer.priceUSDT} USD₮ per month${priceLocal}\n` +
    `   ⭐ ${offer.stars} Telegram Stars\n` +
    `   SLA: ${offer.sla}`
  );
}

module.exports = { getOffersForSubscriber, getOfferById, formatOffer };
