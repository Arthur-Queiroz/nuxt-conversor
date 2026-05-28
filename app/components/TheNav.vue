<script setup lang="ts">
const { locale, t, toggle } = useLocale()
const route = useRoute()
const isRates = computed(() => route.path === '/cotacoes')
</script>

<template>
  <nav class="nav">
    <a href="/" class="logo">
      <span class="logo-mark">$</span>
      <span>
        <div class="logo-name">Conversor</div>
        <div class="logo-sub">{{ t('logo.sub') }}</div>
      </span>
    </a>
    <ul class="nav-links">
      <li><a class="nav-link" :class="{ active: !isRates }" href="/">{{ t('nav.converter') }}</a></li>
      <li><a class="nav-link" :class="{ active: isRates }" href="/cotacoes" target="_blank" rel="noreferrer">{{ t('nav.rates') }}</a></li>
      <li><a class="nav-link" href="/#como-funciona">{{ t('nav.howItWorks') }}</a></li>
      <li><a class="nav-link" href="/#sobre">{{ t('nav.about') }}</a></li>
      <li>
        <button class="lang-toggle" type="button" @click="toggle" :aria-label="`Switch to ${locale === 'pt' ? 'English' : 'Português'}`">
          <span class="lang-opt" :class="{ active: locale === 'pt' }">PT</span>
          <span class="lang-opt" :class="{ active: locale === 'en' }">EN</span>
        </button>
      </li>
      <li>
        <a class="gh-btn" href="https://github.com/Arthur-Queiroz/conversor-nuxt" target="_blank" rel="noreferrer">
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
            <path d="M12 1.27a11 11 0 0 0-3.48 21.46c.55.1.75-.24.75-.53v-1.85c-3.06.67-3.71-1.48-3.71-1.48-.5-1.27-1.22-1.61-1.22-1.61-1-.69.07-.67.07-.67 1.11.08 1.69 1.14 1.69 1.14.99 1.69 2.59 1.2 3.22.92.1-.72.39-1.2.7-1.48-2.45-.28-5.02-1.23-5.02-5.46 0-1.21.43-2.19 1.14-2.96-.12-.28-.5-1.41.11-2.93 0 0 .93-.3 3.05 1.13a10.6 10.6 0 0 1 5.55 0c2.12-1.43 3.05-1.13 3.05-1.13.61 1.52.23 2.65.11 2.93.71.77 1.14 1.75 1.14 2.96 0 4.24-2.58 5.18-5.04 5.45.4.34.76 1.02.76 2.06v3.05c0 .3.2.64.76.53A11 11 0 0 0 12 1.27" />
          </svg>
          GitHub
        </a>
      </li>
    </ul>
  </nav>
</template>
