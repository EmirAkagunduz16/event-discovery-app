/**
 * Shared Ticketmaster API fetch utility with structured error handling.
 * Used by all server/api route handlers.
 */

import type { TmEventSearchParams } from '~~/types/event'

const TM_BASE = 'https://app.ticketmaster.com/discovery/v2'

/** Build a full TM URL with the API key injected */
export function buildTmUrl(
  path: string,
  params: Record<string, string | number | boolean | undefined>,
): string {
  const config = useRuntimeConfig()
  const query = new URLSearchParams()

  query.set('apikey', config.ticketmasterApiKey as string)

  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') {
      query.set(k, String(v))
    }
  }

  return `${TM_BASE}${path}?${query.toString()}`
}

/** Fetch from TM API and normalise errors into H3 createError responses */
export async function tmFetch<T>(url: string): Promise<T> {
  let response: Response

  // Network / timeout error
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(10_000) })
  }
  catch (err: unknown) {
    const isTimeout
      = err instanceof DOMException && err.name === 'TimeoutError'
    throw createError({
      statusCode: 503,
      statusMessage: isTimeout
        ? 'Sunucuya bağlanılamadı (zaman aşımı).'
        : 'Sunucuya bağlanılamadı.',
    })
  }

  // HTTP error codes
  if (!response.ok) {
    switch (response.status) {
      case 429:
        throw createError({
          statusCode: 429,
          statusMessage: 'Çok fazla istek atıldı. Biraz bekleyin.',
        })
      case 401:
      case 403:
        throw createError({
          statusCode: 500,
          statusMessage: 'API key geçersiz.',
        })
      case 400: {
        let detail = 'Geçersiz istek.'
        try {
          const body = await response.json()
          detail
            = body?.errors?.[0]?.detail
              ?? body?.fault?.faultstring
              ?? detail
        }
        catch {}
        throw createError({ statusCode: 400, statusMessage: detail })
      }
      default:
        throw createError({
          statusCode: response.status,
          statusMessage: `Ticketmaster API hatası: ${response.status}`,
        })
    }
  }

  // JSON parse error
  let data: T
  try {
    data = (await response.json()) as T
  }
  catch {
    throw createError({
      statusCode: 500,
      statusMessage: 'Sunucudan geçersiz veri geldi.',
    })
  }

  return data
}

/** Strip undefined/empty values from params object */
export function pickTmParams(
  params: Partial<TmEventSearchParams>,
): Record<string, string | number | boolean | undefined> {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== ''),
  ) as Record<string, string | number | boolean | undefined>
}
