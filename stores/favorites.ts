// Favorites store — Pinia + localStorage

import type { EventCard } from '../types/event'
import { defineStore } from 'pinia'

export const useFavoritesStore = defineStore('favorites', {
  state: () => ({
    events: [] as EventCard[],
  }),

  getters: {
    favorites: state => state.events,
    ids: state => state.events.map(e => e.id),
    isFavorite: state => (id: string) => state.events.some(e => e.id === id),
    count: state => state.events.length,
  },

  actions: {
    addFavorite(event: EventCard) {
      if (!this.events.some(e => e.id === event.id)) {
        this.events.push(event)
        this._save()
      }
    },

    removeFavorite(id: string) {
      const index = this.events.findIndex(e => e.id === id)
      if (index !== -1) {
        this.events.splice(index, 1)
        this._save()
      }
    },

    toggleFavorite(event: EventCard) {
      this.toggle(event)
    },

    toggle(event: EventCard) {
      const index = this.events.findIndex(e => e.id === event.id)
      if (index === -1) {
        this.events.push(event)
      }
      else {
        this.events.splice(index, 1)
      }
      this._save()
    },

    clearAll() {
      this.events = []
      this._save()
    },

    hydrate() {
      if (import.meta.server)
        return
      try {
        const raw = localStorage.getItem('eda:favorites')
        if (!raw)
          return

        const parsed = JSON.parse(raw)

        // Bozuk veri toleransı: array olmalı ve her öğede en azından id + name olmalı
        if (!Array.isArray(parsed)) {
          this.events = []
          return
        }

        this.events = parsed.filter(
          (e: unknown) => typeof e === 'object' && e !== null && 'id' in e && 'name' in e,
        ) as EventCard[]
      }
      catch {
        // JSON.parse hatası, bozuk veri — sessizce boş başla
        this.events = []
      }
    },

    _save() {
      if (import.meta.server)
        return
      localStorage.setItem('eda:favorites', JSON.stringify(this.events))
    },
  },
})
