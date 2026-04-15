/**
 * start.js
 *
 * Shared helpers:
 *   sendStartScreen — full welcome message, called on /start
 *   sendStartButton — minimal Start button, called on Cancel
 */

const { Markup } = require('telegraf');

function sendStartScreen(ctx) {
  const name = ctx.from.first_name || 'there';
  return ctx.reply(
    `👋 Welcome to blocfone®, ${name}!\n\n` +
    `blocfone® is a patented, real-time, neutral, and open marketplace where mobile subscribers experience uncomplicated connectivity with participating mobile providers, by paying in cryptocurrency (e.g., stablecoin), and having service terms enforced automatically by smart contracts. In return, mobile providers boost customer loyalty and expand revenue streams while delivering better customer experiences and driving efficiencies by eliminating multi-carrier agreements.\n\n` +
    `What would you like to do?\n\n` +
    `/offers — Browse available service plans\n` +
    `/status — View your active subscription\n` +
    `/help   — How blocfone® works`,
    Markup.removeKeyboard()
  );
}

function sendStartButton(ctx) {
  return ctx.reply(
    'Tap Start to begin.',
    Markup.keyboard([['Start']])
      .resize()
      .oneTime()
  );
}

module.exports = { sendStartScreen, sendStartButton };
