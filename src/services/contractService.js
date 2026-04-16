/**
 * contractService.js
 *
 * Mock smart contract lifecycle manager.
 * Patent ref: Claims 1, 8 — smart contracts govern offer acceptance,
 * payment escrow, service delivery, and performance enforcement.
 *
 * SWAP: Replace with real Solidity contract calls (ethers.js / web3.js)
 * against ServiceAgreement.sol, EscrowVault.sol, PerformanceOracle.sol
 * when funded.
 */

const { v4: uuidv4 } = require('uuid');

// In-memory store — swap for PostgreSQL in production
const activeContracts = new Map();

// Maps period label to milliseconds for expiry calculation
const PERIOD_MS = {
  '1 day':   1 * 24 * 60 * 60 * 1000,
  '1 week':  7 * 24 * 60 * 60 * 1000,
  '1 month': 30 * 24 * 60 * 60 * 1000,
  '1 year':  365 * 24 * 60 * 60 * 1000,
};

/**
 * Creates a new service contract after payment is confirmed.
 * @param {string} subscriberId - Telegram user ID
 * @param {Object} offer - accepted offer
 * @param {Object} payment - confirmed payment details
 * @param {string} period - selected fixed price period
 * @returns {Object} contract record
 */
function createContract(subscriberId, offer, payment, period = '1 month', localPrice = '') {
  const durationMs = PERIOD_MS[period] || PERIOD_MS['1 month'];
  const contract = {
    id: uuidv4(),
    subscriberId,
    provider: offer.provider,
    plan: `${offer.data} · ${offer.speed}`,
    priceUSDT: payment.amount,
    basePriceUSDT: offer.priceUSDT,
    localPrice,
    stars: offer.stars,
    cryptoCurrency: offer.cryptoCurrency,
    period,
    txHash: payment.txHash,
    status: 'active',
    sla: offer.sla,
    activatedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + durationMs).toISOString(),
    performance: {
      uptimePercent: null,
      violations: 0,
    },
  };

  activeContracts.set(subscriberId, contract);
  return contract;
}

/**
 * Returns the active contract for a subscriber, or null.
 * @param {string} subscriberId
 * @returns {Object|null}
 */
function getContract(subscriberId) {
  return activeContracts.get(subscriberId) || null;
}

/**
 * Formats a contract summary for Telegram display.
 * @param {Object} contract
 * @returns {string}
 */
function formatContract(contract) {
  const formatDate = (iso) => {
    const d = new Date(iso);
    const day = d.getDate().toString().padStart(2, '0');
    const month = d.toLocaleString('en-GB', { month: 'long' });
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };
  const activated = formatDate(contract.activatedAt);
  const expires = formatDate(contract.expiresAt);
  return (
    `📋 *Active Contract*\n\n` +
    `Provider: ${contract.provider}\n` +
    `Plan: ${contract.plan}\n` +
    `🗓 Fixed price for: ${contract.period}\n` +
    `Price: ${contract.priceUSDT} USD₮ for ${contract.period} (${contract.localPrice})\n` +
    `SLA: ${contract.sla}\n` +
    `Status: ✅ Active\n` +
    `Activated: ${activated}\n` +
    `Renews: ${expires}\n` +
    `Tx: \`${contract.txHash}\``
  );
}

module.exports = { createContract, getContract, formatContract };
