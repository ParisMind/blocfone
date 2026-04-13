/**
 * walletService.js
 *
 * Mock crypto wallet — simulates payment confirmation for demo purposes.
 * Patent ref: Claims 4–6 — subscriber pays for accepted offer using
 * cryptocurrency; payment held in escrow pending service delivery.
 *
 * SWAP: Replace confirmPayment() with a real BTCPay Server or
 * Ethereum/Lightning Network payment request when funded.
 */

/**
 * Simulates generating a payment address for the subscriber.
 * Production: generate a real on-chain address or Lightning invoice.
 * @param {Object} offer - the selected offer
 * @returns {Object} mock payment details
 */
function createPaymentRequest(offer) {
  return {
    address: `0xMOCK_${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
    amount: offer.priceCrypto,
    currency: offer.cryptoCurrency,
    expiresIn: '15 minutes',
    memo: `blocfone® — ${offer.provider} — ${offer.data} plan`,
  };
}

/**
 * Simulates confirming a crypto payment.
 * Production: poll blockchain for tx confirmation.
 * @param {string} paymentAddress
 * @returns {Object} mock confirmation result
 */
function confirmPayment(paymentAddress) {
  // Mock: always succeeds after a simulated delay
  return {
    confirmed: true,
    txHash: `0xTX_${Math.random().toString(36).slice(2, 18).toUpperCase()}`,
    timestamp: new Date().toISOString(),
    address: paymentAddress,
  };
}

module.exports = { createPaymentRequest, confirmPayment };
