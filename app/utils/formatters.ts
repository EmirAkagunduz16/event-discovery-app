const MONTHS_TR = [
  'Ocak',
  'Şubat',
  'Mart',
  'Nisan',
  'Mayıs',
  'Haziran',
  'Temmuz',
  'Ağustos',
  'Eylül',
  'Ekim',
  'Kasım',
  'Aralık',
]

/**
 * Format event date and time into Turkish representation (e.g. "25 Aralık 2024, 19:30")
 * Timezone-agnostic to prevent day shift across different user timezones.
 */
export function formatEventDate(
  localDate?: string | null,
  localTime?: string | null,
): string | null {
  if (!localDate)
    return null

  const parts = localDate.split('-').map(Number)
  if (parts.length < 3 || parts.some(n => Number.isNaN(n)))
    return localDate

  const [year, month, day] = parts
  const monthName = MONTHS_TR[(month ?? 1) - 1] ?? ''
  const dateStr = `${day} ${monthName} ${year}`.trim()

  if (!localTime)
    return dateStr

  const [hours, minutes] = localTime.split(':')
  if (hours && minutes) {
    return `${dateStr}, ${hours}:${minutes}`
  }

  return dateStr
}
