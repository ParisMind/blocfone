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

/**
 * Creates a new service contract after payment is confirmed.
 * @param {string} subscriberId - Telegram user ID
 * @param {Object} offer - accepted offer
 * @param {Object} payment - confirmed payment details
 * @returns {Object} contract record
 */
function createContract(subscriberId, offer, payment) {
  const contract = {
    id: uuidv4(),
    subscriberId,
    provider: offer.provider,
    plan: `${offer.data} · ${offer.speed}`,
    priceUSDT: offer.priceUSDT,
    cryptoCurrency: offer.cryptoCurrency,
    txHash: payment.txHash,
    status: 'active',
    sla: offer.sla,
    activatedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    performance: {
      uptimePercent: null, // populated by PerformanceOracle in production
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
    `Price: ${contract.priceUSDT} USD₮ per month\n` +
    `SLA: ${contract.sla}\n` +
    `Status: ✅ Active\n` +
    `Activated: ${activated}\n` +
    `Renews: ${expires}\n` +
    `Tx: \`${contract.txHash}\``
  );
}

module.exports = { createContract, getContract, formatContract };
