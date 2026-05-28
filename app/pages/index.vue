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

const CURRENCIES = [
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

// 1 unit of currency = X BRL
const ratesInBRL = computed(() => {
  const map: Record<string, number> = { BRL: 1 }
  if (data.value?.rates) {
    for (const [code, r] of Object.entries(data.value.rates)) {
      map[code] = r.bid
    }
  }
  return map
})

const from       = ref('BRL')
const to         = ref('USD')
const amountStr  = ref('1.000,00')
const copied     = ref(false)
const openPicker = ref<'from' | 'to' | null>(null)
const secondsAgo = ref(0)

const fromPickerRef = ref<HTMLElement | null>(null)
const toPickerRef   = ref<HTMLElement | null>(null)

function formatBR(n: number, opts = { min: 2, max: 2 }) {
  if (n == null || isNaN(n)) return '0,00'
  return n.toLocaleString('pt-BR', { minimumFractionDigits: opts.min, maximumFractionDigits: opts.max })
}
function parseBR(s: string): number {
  const cleaned = String(s).replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.')
  const n = parseFloat(cleaned)
  return isFinite(n) ? n : 0
}

const amount    = computed(() => parseBR(amountStr.value))
const converted = computed(() => {
  const f = ratesInBRL.value[from.value] ?? 1
  const t2 = ratesInBRL.value[to.value] ?? 1
  return amount.value * f / t2
})
const pairRate = computed(() => {
  const f = ratesInBRL.value[from.value] ?? 1
  const t2 = ratesInBRL.value[to.value] ?? 1
  return f / t2
})
const formattedConverted = computed(() => {
  const c = converted.value
  return formatBR(c, { min: 2, max: c < 1 ? 6 : 2 })
})
const currentFrom = computed(() => CURRENCIES.find(c => c.code === from.value)!)
const currentTo   = computed(() => CURRENCIES.find(c => c.code === to.value)!)

function formatAmount() {
  amountStr.value = formatBR(parseBR(amountStr.value))
}
function swap() {
  const prev = converted.value
  ;[from.value, to.value] = [to.value, from.value]
  amountStr.value = formatBR(prev)
}
async function copyResult() {
  const text = `${currentFrom.value.sym} ${formatBR(amount.value)} = ${currentTo.value.sym} ${formattedConverted.value}`
  try { await navigator.clipboard.writeText(text) } catch {}
  copied.value = true
  setTimeout(() => { copied.value = false }, 1500)
}
function flagSrc(cc: string) {
  return cc === 'eu' ? '/flags/eu.svg' : `https://flagcdn.com/w80/${cc}.png`
}
function flagSrcSet(cc: string): string | undefined {
  return cc === 'eu' ? undefined : `https://flagcdn.com/w160/${cc}.png 2x`
}
function selectFrom(code: string) { from.value = code; openPicker.value = null }
function selectTo(code: string)   { to.value = code;   openPicker.value = null }

let refreshInterval: ReturnType<typeof setInterval>
onMounted(() => {
  refreshInterval = setInterval(() => {
    secondsAgo.value++
    if (secondsAgo.value >= 30) { refresh(); secondsAgo.value = 0 }
  }, 1000)

  document.addEventListener('mousedown', (e) => {
    if (openPicker.value === 'from' && fromPickerRef.value && !fromPickerRef.value.contains(e.target as Node)) {
      openPicker.value = null
    } else if (openPicker.value === 'to' && toPickerRef.value && !toPickerRef.value.contains(e.target as Node)) {
      openPicker.value = null
    }
  })
})
onUnmounted(() => clearInterval(refreshInterval))
</script>

<template>
  <div class="page">

    <TheNav />

    <div class="dot-divider"><div /></div>

    <!-- HERO -->
    <section class="hero">
      <div class="eyebrow">
        <span class="eyebrow-pill">v0.1</span>
        <span class="eyebrow-dot" />
        <span>{{ t('hero.eyebrow') }}</span>
      </div>
      <h1 class="hero-title">{{ t('hero.title') }}</h1>
      <p class="hero-sub">
        {{ t('hero.subBefore') }}&nbsp;
        <span class="nuxt-tag"><span class="nuxt-dot" /> Nuxt 3</span>{{ t('hero.subAfter') }}
      </p>
    </section>

    <!-- CONVERTER CARD -->
    <div class="converter-wrap" id="conversor">
      <div class="converter">
        <div class="conv-grid">

          <!-- DE -->
          <div class="conv-side">
            <div class="conv-label"><span>{{ t('converter.from') }}</span></div>
            <div class="picker-wrap" ref="fromPickerRef">
              <button class="cur-picker" type="button" @click="openPicker = openPicker === 'from' ? null : 'from'" :aria-expanded="openPicker === 'from'">
                <img class="flag-img" :src="flagSrc(currentFrom.cc)" :srcset="flagSrcSet(currentFrom.cc)" :alt="currentFrom.code" />
                <span class="cur-code">{{ currentFrom.code }}</span>
                <svg class="cur-chevron" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 4.5 6 7.5 9 4.5" />
                </svg>
              </button>
              <div class="picker-menu" :class="{ open: openPicker === 'from' }">
                <div v-for="c in CURRENCIES" :key="c.code"
                  class="picker-item"
                  :class="{ selected: c.code === from, disabled: c.code === to }"
                  @click="c.code !== to && selectFrom(c.code)"
                >
                  <img class="picker-flag" :src="flagSrc(c.cc)" :srcset="flagSrcSet(c.cc)" :alt="c.code" />
                  <span class="picker-code">{{ c.code }}</span>
                  <span class="picker-name">{{ t('currencies.' + c.code) }}</span>
                  <svg v-if="c.code === from" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="14" height="14">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              </div>
            </div>
            <label class="amount-box">
              <input
                class="amount-input"
                type="text"
                inputmode="decimal"
                v-model="amountStr"
                @blur="formatAmount"
                aria-label="Valor a converter"
              />
              <div class="amount-meta">
                <span>{{ t('currencies.' + currentFrom.code) }}</span>
                <span class="sym">{{ currentFrom.sym }}</span>
              </div>
            </label>
          </div>

          <!-- SWAP -->
          <div class="swap-col">
            <button class="swap-btn" type="button" @click="swap" aria-label="Trocar moedas">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="22" height="22">
                <path d="M7 4 L3 8 L7 12" />
                <path d="M3 8 H21" />
                <path d="M17 20 L21 16 L17 12" />
                <path d="M21 16 H3" />
              </svg>
            </button>
          </div>

          <!-- PARA -->
          <div class="conv-side">
            <div class="conv-label">
              <span>{{ t('converter.to') }}</span>
              <span class="live"><span class="rate-pulse" /> {{ t('converter.live') }}</span>
            </div>
            <div class="picker-wrap" ref="toPickerRef">
              <button class="cur-picker" type="button" @click="openPicker = openPicker === 'to' ? null : 'to'" :aria-expanded="openPicker === 'to'">
                <img class="flag-img" :src="flagSrc(currentTo.cc)" :srcset="flagSrcSet(currentTo.cc)" :alt="currentTo.code" />
                <span class="cur-code">{{ currentTo.code }}</span>
                <svg class="cur-chevron" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 4.5 6 7.5 9 4.5" />
                </svg>
              </button>
              <div class="picker-menu" :class="{ open: openPicker === 'to' }">
                <div v-for="c in CURRENCIES" :key="c.code"
                  class="picker-item"
                  :class="{ selected: c.code === to, disabled: c.code === from }"
                  @click="c.code !== from && selectTo(c.code)"
                >
                  <img class="picker-flag" :src="flagSrc(c.cc)" :srcset="flagSrcSet(c.cc)" :alt="c.code" />
                  <span class="picker-code">{{ c.code }}</span>
                  <span class="picker-name">{{ t('currencies.' + c.code) }}</span>
                  <svg v-if="c.code === to" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="14" height="14">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              </div>
            </div>
            <div class="amount-box output amount-readonly">
              <div class="amount-input">{{ formattedConverted }}</div>
              <div class="amount-meta">
                <span>{{ t('currencies.' + currentTo.code) }}</span>
                <span class="sym">{{ currentTo.sym }}</span>
              </div>
            </div>
          </div>

        </div>

        <!-- CARD FOOTER -->
        <div class="conv-footer">
          <div class="rate-line">
            <span>
              <span class="rate-value">1&nbsp;{{ from }}</span>
              <span class="rate-eq">=</span>
              <span class="rate-value">{{ formatBR(pairRate, { min: 4, max: pairRate < 0.01 ? 8 : 4 }) }}&nbsp;{{ to }}</span>
            </span>
            <span class="rate-divider" />
            <span class="rate-fresh">
              <span class="rate-pulse" /> {{ t('converter.updatedAgo', { n: secondsAgo }) }}
            </span>
          </div>
          <div class="actions">
            <button class="btn accent" @click="copyResult" style="position:relative">
              <svg v-if="copied" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              {{ copied ? t('converter.copied') : t('converter.copy') }}
              <span class="copied-toast" :class="{ show: copied }">{{ t('converter.toast') }}</span>
            </button>
          </div>
        </div>
      </div>

    </div>

    <div class="dot-divider"><div /></div>

    <!-- COMO FUNCIONA -->
    <section id="como-funciona" class="how-section">
      <div class="how-header">
        <div class="how-eyebrow">
          <span class="how-eyebrow-line" />
          {{ t('how.eyebrow') }}
          <span class="how-eyebrow-line" />
        </div>
        <h2 class="how-title">{{ t('how.titleBefore') }} <em>{{ t('how.titleEm') }}</em></h2>
        <p class="how-sub">{{ t('how.sub') }}</p>
      </div>

      <div class="steps-grid">
        <!-- Step 1 -->
        <div class="step-card">
          <div class="step-top">
            <span class="step-num">{{ t('how.step1Num') }}</span>
            <div class="step-icon-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18">
                <path d="M7 4 L3 8 L7 12" /><path d="M3 8 H21" />
                <path d="M17 20 L21 16 L17 12" /><path d="M21 16 H3" />
              </svg>
            </div>
          </div>
          <h3 class="step-title">{{ t('how.step1Title') }}</h3>
          <p class="step-desc">{{ t('how.step1Desc') }}</p>
        </div>

        <!-- Step 2 -->
        <div class="step-card">
          <div class="step-top">
            <span class="step-num">{{ t('how.step2Num') }}</span>
            <div class="step-icon-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18">
                <rect x="2" y="6" width="20" height="12" rx="2" />
                <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8" />
              </svg>
            </div>
          </div>
          <h3 class="step-title">{{ t('how.step2Title') }}</h3>
          <p class="step-desc">{{ t('how.step2Desc') }}</p>
        </div>

        <!-- Step 3 -->
        <div class="step-card">
          <div class="step-top">
            <span class="step-num">{{ t('how.step3Num') }}</span>
            <div class="step-icon-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </div>
          </div>
          <h3 class="step-title">{{ t('how.step3Title') }}</h3>
          <p class="step-desc">{{ t('how.step3Desc') }}</p>
        </div>
      </div>

    </section>

    <div class="dot-divider"><div /></div>

    <!-- SOBRE -->
    <section id="sobre" class="sobre-section">
      <div class="sobre-header">
        <div class="how-eyebrow">
          <span class="how-eyebrow-line" />
          {{ t('about.eyebrow') }}
          <span class="how-eyebrow-line" />
        </div>
        <h2 class="how-title">{{ t('about.titleBefore') }} <em>{{ t('about.titleEm') }}</em></h2>
        <p class="how-sub">{{ t('about.sub') }}</p>
      </div>

      <div class="tech-card">
        <div class="tech-inner">
          <div>
            <div class="tech-title">{{ t('how.techTitle') }}</div>
            <p class="tech-desc">{{ t('how.techDesc') }}</p>
          </div>
          <div class="tech-badges">
            <span class="tech-badge"><span class="nuxt-dot" />{{ t('how.techBadge1') }}</span>
            <span class="tech-badge">{{ t('how.techBadge2') }}</span>
            <span class="tech-badge">{{ t('how.techBadge3') }}</span>
          </div>
        </div>
      </div>
    </section>

  </div>
</template>
