// Favorites store — Pinia + localStorage

import type { EventCard } from '../types/event'
import { defineStore } from 'pinia'

export const useFavoritesStore = defineStore('favorites', {
  state: () => ({
    events: [] as EventCard[],
  }),

  getters: {
    ids: state => state.events.map(e => e.id),
    isFavorite: state => (id: string) => state.events.some(e => e.id === id),
    count: state => state.events.length,
  },

  actions: {
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

    hydrate() {
      if (import.meta.server)
        return
      try {
        const raw = localStorage.getItem('eda:favorites')
        if (raw)
          this.events = JSON.parse(raw)
      }
      catch {}
    },

    _save() {
      if (import.meta.server)
        return
      localStorage.setItem('eda:favorites', JSON.stringify(this.events))
    },
  },
})
