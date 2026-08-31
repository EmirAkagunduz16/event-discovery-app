// GET /api/events/:id
// Fetch a single event by Ticketmaster ID (includes embedded venues & attractions)

import type { TmEvent } from '~/types/event'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Etkinlik ID gereklidir.' })
  }

  const url = buildTmUrl(`/events/${encodeURIComponent(id)}.json`, {})
  return tmFetch<TmEvent>(url)
})
