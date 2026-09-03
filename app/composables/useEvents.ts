// useEvents — fetch event list and single event detail with caching and not-found distinction

import type { TmEvent, TmEventSearchParams, TmEventsResponse } from '~~/types/event'

// Query cache map for memoizing getEvents calls by serialized parameters
const eventsCache = new Map<string, TmEventsResponse>()

export function useEvents() {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const data = ref<TmEventsResponse | null>(null)
  const currentEvent = ref<TmEvent | null>(null)
  const isNotFound = ref(false)

  async function getEvents(params: Partial<TmEventSearchParams> = {}) {
    const cacheKey = JSON.stringify(params)
    if (eventsCache.has(cacheKey)) {
      data.value = eventsCache.get(cacheKey)!
      error.value = null
      return
    }

    loading.value = true
    error.value = null

    try {
      const res = await $fetch<TmEventsResponse>('/api/events', { params })
      data.value = res
      eventsCache.set(cacheKey, res)
    }
    catch (err: unknown) {
      const e = err as { statusMessage?: string, message?: string }
      error.value = e?.statusMessage ?? e?.message ?? 'Etkinlikler yüklenemedi.'
    }
    finally {
      loading.value = false
    }
  }

  async function getEventById(id: string) {
    loading.value = true
    error.value = null
    isNotFound.value = false
    currentEvent.value = null

    try {
      currentEvent.value = await $fetch<TmEvent>(`/api/events/${id}`)
    }
    catch (err: unknown) {
      const e = err as { statusCode?: number, status?: number, statusMessage?: string, message?: string }
      const status = e?.statusCode ?? e?.status
      if (status === 404) {
        isNotFound.value = true
        error.value = 'Etkinlik bulunamadı.'
      }
      else {
        error.value = e?.statusMessage ?? e?.message ?? 'Etkinlik yüklenemedi.'
      }
    }
    finally {
      loading.value = false
    }
  }

  function clearCache() {
    eventsCache.clear()
  }

  return {
    loading,
    error,
    isNotFound,
    data,
    currentEvent,
    getEvents,
    getEventById,
    clearCache,
  }
}
