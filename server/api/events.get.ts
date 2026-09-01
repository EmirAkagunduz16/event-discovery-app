// GET /api/events
// Search events from Ticketmaster Discovery API
// Accepts: keyword, city, classificationName, countryCode, startDateTime, endDateTime, sort, page, size

import type { TmEventSearchParams, TmEventsResponse } from '~~/types/event'

export default defineEventHandler(async (event) => {
  const query = getQuery(event) as Partial<TmEventSearchParams>

  // Yaklaşan/güncel etkinlikleri getirmek için başlangıç tarihi belirtilmemişse varsayılan olarak şu anki zamanı kullan
  const now = `${new Date().toISOString().split('.')[0]}Z`
  const params: Partial<TmEventSearchParams> = {
    ...(!query.startDateTime && !query.localStartDateTime ? { startDateTime: now } : {}),
    ...query,
  }

  const url = buildTmUrl('/events.json', pickTmParams(params))
  return tmFetch<TmEventsResponse>(url)
})
