// https://nuxt.com/docs/api/configuration/nuxt-config
import process from 'node:process'

export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@pinia/nuxt',
  ],

  pinia: {
    storesDirs: ['./stores/**'],
  },

  devtools: {
    enabled: true,
  },

  css: ['~/assets/css/main.css'],

  compatibilityDate: '2026-06-30',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs',
      },
    },
  },
  runtimeConfig: {
    ticketmasterApiKey: process.env.TICKETMASTER_API_KEY,
  },
})
