// useEvents — fetch event list and single event detail

import type { TmEvent, TmEventSearchParams, TmEventsResponse } from '~~/types/event'

export function useEvents() {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const data = ref<TmEventsResponse | null>(null)
  const currentEvent = ref<TmEvent | null>(null)

  async function getEvents(params: Partial<TmEventSearchParams> = {}) {
    loading.value = true
    error.value = null

    try {
      data.value = await $fetch<TmEventsResponse>('/api/events', { params })
    }
    catch (err: unknown) {
      error.value = (err as { statusMessage?: string })?.statusMessage ?? 'Etkinlikler yüklenemedi.'
    }
    finally {
      loading.value = false
    }
  }

  async function getEventById(id: string) {
    loading.value = true
    error.value = null
    currentEvent.value = null

    try {
      currentEvent.value = await $fetch<TmEvent>(`/api/events/${id}`)
    }
    catch (err: unknown) {
      error.value = (err as { statusMessage?: string })?.statusMessage ?? 'Etkinlik yüklenemedi.'
    }
    finally {
      loading.value = false
    }
  }

  return { loading, error, data, currentEvent, getEvents, getEventById }
}
