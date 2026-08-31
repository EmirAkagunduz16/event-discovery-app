// useVenues — fetch venues by keyword or city

import type { TmVenue, TmVenuesResponse } from '~~/types/event'

export function useVenues() {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const venues = ref<TmVenue[]>([])

  async function getVenues(params: { keyword?: string, city?: string, countryCode?: string } = {}) {
    loading.value = true
    error.value = null

    try {
      const data = await $fetch<TmVenuesResponse>('/api/venues', { params })
      venues.value = data._embedded?.venues ?? []
    }
    catch (err: unknown) {
      error.value = (err as { statusMessage?: string })?.statusMessage ?? 'Mekanlar yüklenemedi.'
    }
    finally {
      loading.value = false
    }
  }

  return { loading, error, venues, getVenues }
}
