/**
 * status.js
 *
 * /status command — displays the subscriber's active contract.
 * Patent ref: Claim 8 — system monitors performance to ensure mobile
 * services are provided based on the purchased offer.
 */

const { getContract, formatContract } = require('../services/contractService');

function showStatus(ctx) {
  const subscriberId = String(ctx.from.id);
  const contract = getContract(subscriberId);

  if (!contract) {
    ctx.reply(
      `You don't have an active subscription yet.\n\nType /offers to browse available plans.`
    );
    return;
  }

  ctx.replyWithMarkdown(formatContract(contract));
}

module.exports = { showStatus };
