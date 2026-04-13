/**
 * onboard.js
 *
 * /start scene — collects subscriber location consent and wallet address.
 * Patent ref: device 110a (subscriber device) initiating service discovery.
 *
 * In this demo the scene is kept lightweight; /start goes straight to
 * a welcome message and the subscriber jumps to /offers when ready.
 */

const { Scenes } = require('telegraf');

const onboardScene = new Scenes.BaseScene('onboard');

onboardScene.enter((ctx) => {
  ctx.reply(
    `Let's get you set up.\n\n` +
    `blocfone® uses your location to find carriers with coverage in your area. ` +
    `In this demo, location is simulated.\n\n` +
    `Type /offers to see available plans, or /help to learn more.`
  );
});

module.exports = { onboardScene };
