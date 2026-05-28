const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'ARS', 'JPY', 'PYG'] as const
const BASE_CURRENCY = 'BRL'
const AWESOMEAPI_BASE = 'https://economia.awesomeapi.com.br/json/last'

export type CurrencyCode = typeof SUPPORTED_CURRENCIES[number] | typeof BASE_CURRENCY

export interface Rate {
  code: CurrencyCode
  name: string
  bid: number
  ask: number
  high: number
  low: number
  pctChange: number
  timestamp: number
}

interface AwesomeAPIResponse {
  code: string
  codein: string
  name: string
  high: string
  low: string
  varBid: string
  pctChange: string
  bid: string
  ask: string
  timestamp: string
  create_date: string
}

export type RatesMap = Partial<Record<CurrencyCode, Rate>>

export async function fetchRates(): Promise<RatesMap> {
  const pairs = SUPPORTED_CURRENCIES.map(c => `${c}-${BASE_CURRENCY}`).join(',')

  const data = await $fetch<Record<string, AwesomeAPIResponse>>(
    `${AWESOMEAPI_BASE}/${pairs}`,
  )

  const rates: RatesMap = {}

  for (const value of Object.values(data)) {
    const code = value.code as CurrencyCode
    rates[code] = {
      code,
      name: value.name,
      bid: parseFloat(value.bid),
      ask: parseFloat(value.ask),
      high: parseFloat(value.high),
      low: parseFloat(value.low),
      pctChange: parseFloat(value.pctChange),
      timestamp: parseInt(value.timestamp),
    }
  }

  return rates
}

export { SUPPORTED_CURRENCIES, BASE_CURRENCY }
