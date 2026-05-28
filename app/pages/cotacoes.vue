<script setup lang="ts">
interface Rate {
  code: string
  name: string
  bid: number
  ask: number
  high: number
  low: number
  pctChange: number
  timestamp: number
}
interface RatesResponse {
  base: string
  supportedCurrencies: string[]
  rates: Record<string, Rate>
}

const ALL_CURRENCIES = [
  { cc: 'br', code: 'BRL', sym: 'R$' },
  { cc: 'us', code: 'USD', sym: '$'  },
  { cc: 'eu', code: 'EUR', sym: '€'  },
  { cc: 'gb', code: 'GBP', sym: '£'  },
  { cc: 'ar', code: 'ARS', sym: '$'  },
  { cc: 'jp', code: 'JPY', sym: '¥'  },
  { cc: 'py', code: 'PYG', sym: '₲'  },
]

const { t } = useLocale()
const { data, refresh } = await useFetch<RatesResponse>('/api/rates')

const baseCode = ref<'BRL' | 'USD'>('BRL')
const secondsAgo = ref(0)

let refreshInterval: ReturnType<typeof setInterval>
onMounted(() => {
  refreshInterval = setInterval(() => {
    secondsAgo.value++
    if (secondsAgo.value >= 30) { refresh(); secondsAgo.value = 0 }
  }, 1000)
})
onUnmounted(() => clearInterval(refreshInterval))

const rateRows = computed(() => {
  const rates = data.value?.rates ?? {}
  const usd = rates['USD']
  const usdBid = usd?.bid ?? 1
  const usdAsk = usd?.ask ?? 1
  const usdPct = usd?.pctChange ?? 0

  return ALL_CURRENCIES
    .filter(c => c.code !== baseCode.value)
    .map(c => {
      if (baseCode.value === 'BRL') {
        const r = rates[c.code]
        return {
          ...c,
          bid:       r?.bid       ?? 0,
          ask:       r?.ask       ?? 0,
          high:      r?.high      ?? 0,
          low:       r?.low       ?? 0,
          pctChange: r?.pctChange ?? 0,
        }
      } else {
        // base = USD: convert everything through USD
        if (c.code === 'BRL') {
          return {
            ...c,
            bid:       1 / usdBid,
            ask:       1 / usdAsk,
            high:      1 / (usd?.low  ?? usdBid),
            low:       1 / (usd?.high ?? usdBid),
            pctChange: -usdPct,
          }
        }
        const r = rates[c.code]
        const rBid = r?.bid ?? 0
        return {
          ...c,
          bid:       rBid    / usdBid,
          ask:       (r?.ask   ?? 0) / usdAsk,
          high:      (r?.high  ?? 0) / usdBid,
          low:       (r?.low   ?? 0) / usdBid,
          pctChange: (r?.pctChange ?? 0) - usdPct,
        }
      }
    })
})

function fmt(n: number): string {
  const decimals = n < 0.01 ? 6 : n < 1 ? 4 : 4
  return n.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}
function flagSrc(cc: string) {
  return cc === 'eu' ? '/flags/eu.svg' : `https://flagcdn.com/w80/${cc}.png`
}
function flagSrcSet(cc: string): string | undefined {
  return cc === 'eu' ? undefined : `https://flagcdn.com/w160/${cc}.png 2x`
}
</script>

<template>
  <div class="page">
    <TheNav />

    <div class="dot-divider"><div /></div>

    <section class="rates-section">
      <div class="rates-header">
        <div class="how-eyebrow">
          <span class="how-eyebrow-line" />
          {{ t('rates.eyebrow') }}
          <span class="how-eyebrow-line" />
        </div>
        <h1 class="how-title">{{ t('rates.title') }}</h1>
        <p class="how-sub">
          <span>{{ t('rates.sub') }}</span>
          <span class="rate-fresh">
            <span class="rate-pulse" />
            {{ t('converter.updatedAgo', { n: secondsAgo }) }}
          </span>
        </p>
      </div>

      <div class="rates-table-wrap">
        <div class="rates-controls">
          <span class="base-label">{{ t('rates.baseLabel') }}</span>
          <button class="lang-toggle" type="button" aria-label="Selecionar moeda base">
            <span class="lang-opt" :class="{ active: baseCode === 'BRL' }" @click="baseCode = 'BRL'">BRL</span>
            <span class="lang-opt" :class="{ active: baseCode === 'USD' }" @click="baseCode = 'USD'">USD</span>
          </button>
        </div>

        <table class="rates-table">
          <thead>
            <tr>
              <th>{{ t('rates.currency') }}</th>
              <th class="num-col">{{ t('rates.buy') }}</th>
              <th class="num-col">{{ t('rates.sell') }}</th>
              <th class="num-col">{{ t('rates.high') }}</th>
              <th class="num-col">{{ t('rates.low') }}</th>
              <th class="num-col">{{ t('rates.change') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rateRows" :key="row.code">
              <td>
                <div class="cur-cell">
                  <img class="table-flag" :src="flagSrc(row.cc)" :srcset="flagSrcSet(row.cc)" :alt="row.code" />
                  <span class="cur-cell-code">{{ row.code }}</span>
                  <span class="cur-cell-name">{{ t('currencies.' + row.code) }}</span>
                </div>
              </td>
              <td class="num-col">{{ fmt(row.bid) }}</td>
              <td class="num-col">{{ fmt(row.ask) }}</td>
              <td class="num-col">{{ fmt(row.high) }}</td>
              <td class="num-col">{{ fmt(row.low) }}</td>
              <td class="num-col">
                <span class="change-badge" :class="row.pctChange >= 0 ? 'positive' : 'negative'">
                  {{ row.pctChange >= 0 ? '▲' : '▼' }} {{ Math.abs(row.pctChange).toFixed(2) }}%
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="rates-footer">{{ t('rates.baseNote', { base: baseCode }) }}</div>
      </div>
    </section>
  </div>
</template>
