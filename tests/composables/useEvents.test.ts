import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useEvents } from '../../app/composables/useEvents'

const { mockFetch } = vi.hoisted(() => ({
  mockFetch: vi.fn(),
}))

mockNuxtImport('$fetch', () => mockFetch)

describe('useEvents composable', () => {
  beforeEach(() => {
    mockFetch.mockReset()
    const { clearCache } = useEvents()
    clearCache()
  })

  it('senaryo 1 — Başarılı çağrı: veriler state"e aktarılmalı, loading false olmalı, error null kalmalı', async () => {
    const mockEvents = [
      { id: 'ev-1', name: 'Tarkan Konseri' },
      { id: 'ev-2', name: 'Mor ve Ötesi' },
    ]

    mockFetch.mockResolvedValueOnce({
      _embedded: { events: mockEvents },
      page: { size: 12, totalElements: 2, totalPages: 1, number: 0 },
    })

    const { loading, error, data, getEvents } = useEvents()

    expect(loading.value).toBe(false)
    expect(data.value).toBeNull()
    expect(error.value).toBeNull()

    const promise = getEvents()
    expect(loading.value).toBe(true)

    await promise

    expect(loading.value).toBe(false)
    expect(error.value).toBeNull()
    expect(data.value?._embedded?.events).toHaveLength(2)
    expect(data.value?._embedded?.events[0]?.name).toBe('Tarkan Konseri')
    expect(data.value?._embedded?.events[1]?.name).toBe('Mor ve Ötesi')
  })

  it('senaryo 2 — Hatalı çağrı: error state set edilmeli, data null kalmalı, loading false olmalı', async () => {
    mockFetch.mockRejectedValueOnce({
      statusCode: 500,
      statusMessage: 'Sunucu hatası oluştu',
    })

    const { loading, error, data, getEvents } = useEvents()

    await getEvents()

    expect(loading.value).toBe(false)
    expect(data.value).toBeNull()
    expect(error.value).toBe('Sunucu hatası oluştu')
  })

  it('senaryo 3 — getEventById 404 durumu: "bulunamadı" durumu (isNotFound) genel hatadan ayırt edilmeli', async () => {
    mockFetch.mockRejectedValueOnce({
      statusCode: 404,
      statusMessage: 'Event not found',
    })

    const { loading, error, isNotFound, currentEvent, getEventById } = useEvents()

    await getEventById('yok-boyle-bir-id')

    expect(loading.value).toBe(false)
    expect(currentEvent.value).toBeNull()
    expect(isNotFound.value).toBe(true)
    expect(error.value).toBe('Etkinlik bulunamadı.')
  })

  it('senaryo 4 (bonus) — Cache / tekrar istek engelleme: aynı parametrelerle çağrıldığında $fetch 1 kez çalışmalı', async () => {
    const mockResponse = {
      _embedded: { events: [{ id: 'cache-1', name: 'Cached Event' }] },
      page: { size: 12, totalElements: 1, totalPages: 1, number: 0 },
    }

    mockFetch.mockResolvedValue(mockResponse)

    const { data, getEvents } = useEvents()

    // 1. çağrı
    await getEvents({ keyword: 'jazz' })
    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(data.value?._embedded?.events[0]?.name).toBe('Cached Event')

    // 2. çağrı (aynı parametrelerle)
    await getEvents({ keyword: 'jazz' })
    expect(mockFetch).toHaveBeenCalledTimes(1) // Yeni istek atılmadı, cache'ten geldi
  })
})
