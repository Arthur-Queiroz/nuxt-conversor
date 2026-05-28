import { fetchRates, SUPPORTED_CURRENCIES, BASE_CURRENCY } from '../utils/awesomeapi'

export default defineEventHandler(async () => {
  const rates = await fetchRates()

  return {
    base: BASE_CURRENCY,
    supportedCurrencies: [BASE_CURRENCY, ...SUPPORTED_CURRENCIES],
    rates,
  }
})
