/**
 * locationService.js
 *
 * Reverse geocoding — converts GPS coordinates to a city name.
 * Uses OpenStreetMap Nominatim (free, no API key required).
 *
 * Patent ref: Claim 1 — offers transmitted to subscribers are based on
 * the location of the mobile device and coverage available at that location.
 */

/**
 * Converts latitude/longitude to a city name.
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<string>} city name, or fallback string
 */
async function getCityFromCoords(lat, lon) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'blocfone-demo/1.0 (hello@blocfone.io)' },
    });

    if (!res.ok) throw new Error(`Nominatim error: ${res.status}`);

    const data = await res.json();
    const addr = data.address || {};

    // Return the most specific available place name
    const city =
      addr.city ||
      addr.town ||
      addr.village ||
      addr.county ||
      addr.state ||
      'your area';

    return city;
  } catch (err) {
    console.error('Reverse geocoding failed:', err.message);
    return 'your area';
  }
}

module.exports = { getCityFromCoords };
