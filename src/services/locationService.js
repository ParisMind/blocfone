/**
 * locationService.js
 *
 * Reverse geocoding — converts GPS coordinates to a city name, country,
 * local currency code, symbol, and live USD exchange rate.
 *
 * Uses:
 *   - OpenStreetMap Nominatim (reverse geocoding, free, no API key)
 *   - open.er-api.com (exchange rates, free, no API key)
 *
 * Patent ref: Claim 1 — offers transmitted to subscribers are based on
 * the location of the mobile device and coverage available at that location.
 */

// Country code → { currency code, symbol }
const CURRENCY_MAP = {
  us: { code: 'USD', symbol: '$' },
  gb: { code: 'GBP', symbol: '£' },
  ie: { code: 'EUR', symbol: '€' },
  de: { code: 'EUR', symbol: '€' },
  fr: { code: 'EUR', symbol: '€' },
  es: { code: 'EUR', symbol: '€' },
  it: { code: 'EUR', symbol: '€' },
  nl: { code: 'EUR', symbol: '€' },
  be: { code: 'EUR', symbol: '€' },
  pt: { code: 'EUR', symbol: '€' },
  at: { code: 'EUR', symbol: '€' },
  ch: { code: 'CHF', symbol: 'Fr' },
  au: { code: 'AUD', symbol: 'A$' },
  ca: { code: 'CAD', symbol: 'C$' },
  nz: { code: 'NZD', symbol: 'NZ$' },
  sg: { code: 'SGD', symbol: 'S$' },
  hk: { code: 'HKD', symbol: 'HK$' },
  jp: { code: 'JPY', symbol: '¥' },
  cn: { code: 'CNY', symbol: '¥' },
  in: { code: 'INR', symbol: '₹' },
  br: { code: 'BRL', symbol: 'R$' },
  mx: { code: 'MXN', symbol: 'MX$' },
  za: { code: 'ZAR', symbol: 'R' },
  ae: { code: 'AED', symbol: 'AED' },
  sa: { code: 'SAR', symbol: 'SAR' },
  ng: { code: 'NGN', symbol: '₦' },
  ke: { code: 'KES', symbol: 'KSh' },
  gh: { code: 'GHS', symbol: 'GH₵' },
};

/**
 * Converts latitude/longitude to city, country code, and currency info.
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<{ city: string, countryCode: string, currency: { code: string, symbol: string } }>}
 */
async function getLocationInfo(lat, lon) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'blocfone-demo/1.0 (hello@blocfone.io)' },
    });

    if (!res.ok) throw new Error(`Nominatim error: ${res.status}`);

    const data = await res.json();
    const addr = data.address || {};

    const city =
      addr.city || addr.town || addr.village || addr.county || addr.state || 'your area';

    const countryCode = (addr.country_code || 'us').toLowerCase();
    const currency = CURRENCY_MAP[countryCode] || { code: 'USD', symbol: '$' };

    return { city, countryCode, currency };
  } catch (err) {
    console.error('Reverse geocoding failed:', err.message);
    return { city: 'your area', countryCode: 'us', currency: { code: 'USD', symbol: '$' } };
  }
}

/**
 * Fetches live USD exchange rate for a given currency code.
 * @param {string} currencyCode e.g. 'EUR', 'GBP'
 * @returns {Promise<number>} rate (how many units of currencyCode per 1 USD)
 */
async function getExchangeRate(currencyCode) {
  if (currencyCode === 'USD') return 1;

  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD');
    if (!res.ok) throw new Error(`Exchange rate API error: ${res.status}`);
    const data = await res.json();
    return data.rates[currencyCode] || 1;
  } catch (err) {
    console.error('Exchange rate fetch failed:', err.message);
    return 1;
  }
}

/**
 * Converts a USD amount to local currency string.
 * @param {string|number} amountUSD
 * @param {{ code: string, symbol: string }} currency
 * @returns {Promise<string>} e.g. "≈ €11.94"
 */
async function toLocalCurrency(amountUSD, currency) {
  if (currency.code === 'USD') return `≈ $${parseFloat(amountUSD).toFixed(2)}`;
  const rate = await getExchangeRate(currency.code);
  const converted = (parseFloat(amountUSD) * rate).toFixed(2);
  return `≈ ${currency.symbol}${converted}`;
}

module.exports = { getLocationInfo, toLocalCurrency };
