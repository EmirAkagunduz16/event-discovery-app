// GET /api/events
// Search events from Ticketmaster Discovery API
// Accepts: keyword, city, classificationName, countryCode, startDateTime, endDateTime, sort, page, size

import type { TmEventSearchParams, TmEventsResponse } from '~~/types/event'

export default defineEventHandler(async (event) => {
  const query = getQuery(event) as Partial<TmEventSearchParams>

  // Yaklaşan/güncel etkinlikleri getirmek için başlangıç tarihi belirtilmemişse varsayılan olarak şu anki zamanı kullan
  const now = `${new Date().toISOString().split('.')[0]}Z`

  // Kullanıcı özel bir bitiş tarihi girmemişse ve "Uzak -> Yakın" (date,desc) sıralaması istenmişse,
  // Ticketmaster veritabanındaki 5016, 3022 gibi hayali/yer tutucu kayıtları engellemek için
  // makul bir üst sınır (2 yıl sonrası) belirle.
  let defaultEndDateTime: string | undefined
  if (query.sort === 'date,desc' && !query.endDateTime && !query.localEndDateTime) {
    const maxDate = new Date()
    maxDate.setFullYear(maxDate.getFullYear() + 2)
    defaultEndDateTime = `${maxDate.toISOString().split('.')[0]}Z`
  }

  const params: Partial<TmEventSearchParams> = {
    ...(!query.startDateTime && !query.localStartDateTime ? { startDateTime: now } : {}),
    ...(defaultEndDateTime ? { endDateTime: defaultEndDateTime } : {}),
    ...query,
  }

  const url = buildTmUrl('/events.json', pickTmParams(params))
  return tmFetch<TmEventsResponse>(url)
})
