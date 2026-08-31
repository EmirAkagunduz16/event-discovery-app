// GET /api/events
// Search events from Ticketmaster Discovery API
// Accepts: keyword, city, classificationName, countryCode, startDateTime, endDateTime, sort, page, size

import type { TmEventsResponse, TmEventSearchParams } from '~~/types/event'

export default defineEventHandler(async (event) => {
  const query = getQuery(event) as Partial<TmEventSearchParams>
  const url = buildTmUrl('/events.json', pickTmParams(query))
  return tmFetch<TmEventsResponse>(url)
})
