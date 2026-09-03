import type { EventCard } from '~~/types/event'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useFavoritesStore } from '~~/stores/favorites'

const mockEvent: EventCard = {
  id: 'ev-123',
  name: 'Tarkan Harbiye Açıkhava Konseri',
  url: 'https://www.ticketmaster.com/event/123',
  image: 'https://images.ticketmaster.com/tarkan.jpg',
  date: '2026-08-15',
  time: '21:00:00',
  dateTime: '2026-08-15T18:00:00Z',
  status: 'onsale',
  city: 'İstanbul',
  venueName: 'Harbiye Cemil Topuzlu Açıkhava Tiyatrosu',
  segment: 'Müzik',
  genre: 'Pop',
  priceMin: 250,
  priceMax: 1500,
  currency: 'TRY',
}

describe('favorites store', () => {
  beforeEach(() => {
    // Pinia instance'ı kur ve aktif et
    setActivePinia(createPinia())
    // localStorage'ı temizle
    localStorage.clear()
  })

  it('senaryo 1 — Ekleme: başlangıçta boş olan listeye addFavorite ile eleman eklenmeli', () => {
    const store = useFavoritesStore()
    expect(store.events).toHaveLength(0)
    expect(store.favorites).toHaveLength(0)
    expect(store.count).toBe(0)

    store.addFavorite(mockEvent)

    expect(store.events).toHaveLength(1)
    expect(store.favorites).toHaveLength(1)
    expect(store.count).toBe(1)
    expect(store.events[0]?.id).toBe('ev-123')
    expect(store.events[0]?.name).toBe('Tarkan Harbiye Açıkhava Konseri')
  })

  it('senaryo 2 — Tekrar ekleme engellenmesi: aynı event iki kere eklendiğinde dizi tekil kalmalı', () => {
    const store = useFavoritesStore()

    store.addFavorite(mockEvent)
    store.addFavorite(mockEvent)

    expect(store.events).toHaveLength(1)
    expect(store.count).toBe(1)
  })

  it('senaryo 3 — Çıkarma: removeFavorite çağrıldığında ilgili etkinlik silinmeli', () => {
    const store = useFavoritesStore()

    store.addFavorite(mockEvent)
    expect(store.events).toHaveLength(1)

    store.removeFavorite('ev-123')
    expect(store.events).toHaveLength(0)
    expect(store.count).toBe(0)
  })

  it('senaryo 4 — toggleFavorite: ilk çağrıda eklemeli, ikinci çağrıda çıkarmalı', () => {
    const store = useFavoritesStore()

    // 1. çağrı: eklemeli
    store.toggleFavorite(mockEvent)
    expect(store.events).toHaveLength(1)
    expect(store.isFavorite('ev-123')).toBe(true)

    // 2. çağrı: çıkarmalı
    store.toggleFavorite(mockEvent)
    expect(store.events).toHaveLength(0)
    expect(store.isFavorite('ev-123')).toBe(false)
  })

  it('senaryo 5 — isFavorite kontrolü: eklenen id için true, eklenmeyen için false dönmeli', () => {
    const store = useFavoritesStore()

    expect(store.isFavorite('ev-123')).toBe(false)
    expect(store.isFavorite('baska-bir-id')).toBe(false)

    store.addFavorite(mockEvent)

    expect(store.isFavorite('ev-123')).toBe(true)
    expect(store.isFavorite('baska-bir-id')).toBe(false)
  })
})
