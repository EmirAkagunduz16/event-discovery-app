import { mountSuspended } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useFavoritesStore } from '~~/stores/favorites'
import EventCard from '~/components/EventCard.vue'

function createMockEvent(overrides = {}) {
  return {
    id: 'tm-event-1',
    name: 'Fazıl Say Piyano Resitali',
    type: 'event',
    url: 'https://ticketmaster.com/fazil-say',
    locale: 'tr-tr',
    images: [
      {
        ratio: '16_9' as const,
        url: 'https://s1.ticketm.net/dam/a/fazil-say.jpg',
        width: 1024,
        height: 576,
        fallback: false,
      },
    ],
    dates: {
      start: {
        localDate: '2026-11-20',
        localTime: '20:00:00',
        dateTime: '2026-11-20T17:00:00Z',
      },
    },
    classifications: [
      {
        primary: true,
        segment: { id: 'KZFzniwnSyZfZ7v7nJ', name: 'Music' },
        genre: { id: 'KnvZfZ7vAv1', name: 'Classical' },
      },
    ],
    _embedded: {
      venues: [
        {
          id: 'venue-1',
          name: 'Zorlu PSM - Turkcell Sahnesi',
          type: 'venue',
          city: { name: 'İstanbul' },
          country: { name: 'Türkiye', countryCode: 'TR' },
        },
      ],
    },
    ...overrides,
  }
}

describe('eventCard component', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('senaryo 1 — temel render: etkinlik ismi ve şehir adı DOM çıktısında bulunmalı', async () => {
    const mockEvent = createMockEvent()
    const wrapper = await mountSuspended(EventCard, {
      props: { event: mockEvent as any },
    })

    const text = wrapper.text()
    expect(text).toContain('Fazıl Say Piyano Resitali')
    expect(text).toContain('İstanbul')
    expect(text).toContain('Zorlu PSM - Turkcell Sahnesi')
  })

  it('senaryo 2 — görsel yoksa placeholder: images boşken img src değeri placeholder görsele işaret etmeli', async () => {
    const eventWithoutImages = createMockEvent({ images: [] })
    const wrapper = await mountSuspended(EventCard, {
      props: { event: eventWithoutImages as any },
    })

    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    const src = img.attributes('src')
    expect(src).toBe('/placeholder.svg')
    expect(src).not.toContain('ticketm.net')
  })

  it('senaryo 3 — favori butonu tıklaması: toggleFavorite çağrılmalı ve kart tıklama event tetiklenmemeli', async () => {
    const mockEvent = createMockEvent()

    const wrapper = await mountSuspended(EventCard, {
      props: { event: mockEvent as any },
    })

    const store = useFavoritesStore()
    const toggleSpy = vi.spyOn(store, 'toggleFavorite')

    // Kartın kendisine tıklandığında tetiklenecek event listener ekle
    const cardClickSpy = vi.fn()
    wrapper.element.addEventListener('click', cardClickSpy)

    // Favori butonunu bul
    const favButton = wrapper.find('button[aria-label="Favorilere Ekle"]')
    expect(favButton.exists()).toBe(true)

    // Kalp butonuna tıkla
    await favButton.trigger('click')

    // 1. toggleFavorite fonksiyonu çağrılmış olmalı
    expect(toggleSpy).toHaveBeenCalledTimes(1)
    expect(store.isFavorite('tm-event-1')).toBe(true)

    // 2. Kart tıklama event'i tetiklenmemiş olmalı (stopPropagation başarılı)
    expect(cardClickSpy).not.toHaveBeenCalled()
  })

  it('senaryo 4 (bonus) — kategori etiketi: classifications dolu olduğunda kategori adı ekranda görünmeli', async () => {
    const mockEvent = createMockEvent()
    const wrapper = await mountSuspended(EventCard, {
      props: { event: mockEvent as any },
    })

    // formatCategory('Music') -> 'Müzik'
    expect(wrapper.text()).toContain('Müzik')
  })
})
