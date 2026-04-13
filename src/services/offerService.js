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
 * @returns {string}
 */
function formatOffer(offer, index) {
  const coverage = offer.coverage === 'nationwide' ? '🌐 Nationwide' : `📍 ${offer.coverage}`;
  return (
    `${index}. *${offer.provider}*\n` +
    `   ${offer.data} data · ${offer.speed}\n` +
    `   ${coverage}\n` +
    `   💰 ${offer.priceUSD} USD/mo (≈ ${offer.priceCrypto})\n` +
    `   SLA: ${offer.sla}`
  );
}

module.exports = { getOffersForSubscriber, getOfferById, formatOffer };
