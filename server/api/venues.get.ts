/**
 * GET /api/venues
 * Search venues from Ticketmaster Discovery API.
 * Supports: keyword, city, countryCode, stateCode, page, size
 */

import type { TmVenuesResponse } from '~/types/event'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const params: Record<string, string | number | undefined> = {
    keyword: query.keyword as string,
    city: query.city as string,
    countryCode: query.countryCode as string,
    stateCode: query.stateCode as string,
    page: query.page ? Number(query.page) : undefined,
    size: query.size ? Number(query.size) : 20,
    locale: (query.locale as string) || '*',
  }

  const url = buildTmUrl('/venues.json', params)

  return tmFetch<TmVenuesResponse>(url)
})
