// ============================================================
// Ticketmaster Discovery API v2 — TypeScript Type Definitions
// https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/
// ============================================================

// ─────────────────────────────────────────────
// Shared / Primitive Types
// ─────────────────────────────────────────────

export interface TmLink {
  href: string
  templated?: boolean
}

export interface TmLinks {
  self: TmLink
  [key: string]: TmLink
}

export interface TmImage {
  ratio?: '16_9' | '3_2' | '4_3'
  url: string
  width: number
  height: number
  fallback: boolean
  attribution?: string
}

// ─────────────────────────────────────────────
// Classification (Segment → Genre → Sub-Genre)
// ─────────────────────────────────────────────

export interface TmClassificationNode {
  id: string
  name: string
  locale?: string
  level?: number
  subGenres?: TmClassificationNode[]
  primaryId?: string
}

export interface TmClassification {
  primary: boolean
  segment?: TmClassificationNode
  genre?: TmClassificationNode
  subGenre?: TmClassificationNode
  type?: TmClassificationNode
  subType?: TmClassificationNode
  family?: boolean
}

// ─────────────────────────────────────────────
// Venue
// ─────────────────────────────────────────────

export interface TmAddress {
  line1?: string
  line2?: string
  line3?: string
}

export interface TmCity {
  name: string
}

export interface TmState {
  name: string
  stateCode: string
}

export interface TmCountry {
  name: string
  countryCode: string
}

export interface TmLocation {
  longitude: string
  latitude: string
}

export interface TmMarket {
  name: string
  id: string
}

export interface TmDma {
  id: number
}

export interface TmBoxOfficeInfo {
  phoneNumberDetail?: string
  openHoursDetail?: string
  acceptedPaymentDetail?: string
  willCallDetail?: string
}

export interface TmGeneralInfo {
  generalRule?: string
  childRule?: string
}

export interface TmVenueAccessibility {
  ticketLimit?: number
  info?: string
}

export interface TmVenue {
  id: string
  name: string
  type: string
  url?: string
  locale?: string
  timezone?: string
  description?: string
  additionalInfo?: string
  address?: TmAddress
  city?: TmCity
  state?: TmState
  country?: TmCountry
  postalCode?: string
  location?: TmLocation
  markets?: TmMarket[]
  dmas?: TmDma[]
  boxOfficeInfo?: TmBoxOfficeInfo
  parkingDetail?: string
  accessibleSeatingDetail?: string
  generalInfo?: TmGeneralInfo
  accessibility?: TmVenueAccessibility
  images?: TmImage[]
  upcomingEvents?: Record<string, number>
  _links?: TmLinks
}

// ─────────────────────────────────────────────
// Attraction (Artist / Performer)
// ─────────────────────────────────────────────

export interface TmExternalLink {
  url: string
  id?: string
}

export interface TmExternalLinks {
  youtube?: TmExternalLink[]
  twitter?: TmExternalLink[]
  itunes?: TmExternalLink[]
  lastfm?: TmExternalLink[]
  facebook?: TmExternalLink[]
  wiki?: TmExternalLink[]
  instagram?: TmExternalLink[]
  musicbrainz?: TmExternalLink[]
  homepage?: TmExternalLink[]
}

export interface TmAttraction {
  id: string
  name: string
  type: string
  url?: string
  locale?: string
  description?: string
  additionalInfo?: string
  images?: TmImage[]
  classifications?: TmClassification[]
  externalLinks?: TmExternalLinks
  aliases?: string[]
  upcomingEvents?: Record<string, number>
  _links?: TmLinks
}

// ─────────────────────────────────────────────
// Event Date & Time
// ─────────────────────────────────────────────

export interface TmEventDateTime {
  localDate?: string // "YYYY-MM-DD"
  localTime?: string // "HH:mm:ss"
  dateTime?: string // ISO 8601 — "2024-06-15T19:00:00Z"
  dateTBD?: boolean
  dateTBA?: boolean
  timeTBD?: boolean
  noSpecificTime?: boolean
}

export interface TmEventDates {
  start: TmEventDateTime
  end?: TmEventDateTime
  access?: {
    startDateTime?: string
    startApproximate?: boolean
    endDateTime?: string
    endApproximate?: boolean
  }
  timezone?: string
  status?: {
    code: 'onsale' | 'offsale' | 'canceled' | 'postponed' | 'rescheduled'
  }
  spanMultipleDays?: boolean
}

// ─────────────────────────────────────────────
// Ticket & Sales Info
// ─────────────────────────────────────────────

export interface TmSalesDateWindow {
  startDateTime?: string
  startTBD?: boolean
  startTBA?: boolean
  endDateTime?: string
}

export interface TmPresale extends TmSalesDateWindow {
  name?: string
  description?: string
  url?: string
}

export interface TmSales {
  public?: TmSalesDateWindow
  presales?: TmPresale[]
}

export interface TmPriceRange {
  type: 'standard' | 'standard including fees' | string
  currency: string
  min: number
  max: number
}

export interface TmTicketLimit {
  info?: string
  status?: string
}

// ─────────────────────────────────────────────
// Promoter & Product
// ─────────────────────────────────────────────

export interface TmPromoter {
  id: string
  name?: string
  description?: string
}

export interface TmProduct {
  id: string
  name?: string
  url?: string
  type?: string
  classifications?: TmClassification[]
}

// ─────────────────────────────────────────────
// Seat Map
// ─────────────────────────────────────────────

export interface TmSeatmap {
  staticUrl: string
  id?: string
}

// ─────────────────────────────────────────────
// Event Accessibility
// ─────────────────────────────────────────────

export interface TmEventAccessibility {
  ticketLimit?: number
  info?: string
  url?: string
}

// ─────────────────────────────────────────────
// Event (main entity)
// ─────────────────────────────────────────────

export interface TmEvent {
  id: string
  name: string
  type: string
  url: string
  locale?: string
  description?: string
  additionalInfo?: string
  images: TmImage[]
  dates: TmEventDates
  classifications?: TmClassification[]
  promoter?: TmPromoter
  promoters?: TmPromoter[]
  priceRanges?: TmPriceRange[]
  products?: TmProduct[]
  seatmap?: TmSeatmap
  accessibility?: TmEventAccessibility
  ticketLimit?: TmTicketLimit
  ageRestrictions?: {
    legalAgeEnforced?: boolean
  }
  ticketing?: {
    safeTix?: { enabled: boolean }
    allInclusivePricing?: { enabled: boolean }
  }
  sales?: TmSales
  outlets?: Array<{ url: string, type: string }>
  pleaseNote?: string
  info?: string
  test?: boolean
  _links?: TmLinks
  _embedded?: {
    venues?: TmVenue[]
    attractions?: TmAttraction[]
  }
}

// ─────────────────────────────────────────────
// Pagination
// ─────────────────────────────────────────────

export interface TmPage {
  size: number
  totalElements: number
  totalPages: number
  number: number
}

// ─────────────────────────────────────────────
// API List Responses (HAL / _embedded)
// ─────────────────────────────────────────────

export interface TmEventsResponse {
  _embedded?: {
    events: TmEvent[]
  }
  _links?: TmLinks
  page: TmPage
}

export interface TmVenuesResponse {
  _embedded?: {
    venues: TmVenue[]
  }
  _links?: TmLinks
  page: TmPage
}

export interface TmAttractionsResponse {
  _embedded?: {
    attractions: TmAttraction[]
  }
  _links?: TmLinks
  page: TmPage
}

// ─────────────────────────────────────────────
// API Query Parameters
// ─────────────────────────────────────────────

export type TmEventSortOption
  = | 'name,asc'
    | 'name,desc'
    | 'date,asc'
    | 'date,desc'
    | 'relevance,asc'
    | 'relevance,desc'
    | 'distance,asc'
    | 'distance,desc'
    | 'onSaleStartDate,asc'
    | 'onSaleStartDate,desc'
    | 'venueName,asc'
    | 'venueName,desc'

export interface TmEventSearchParams {
  keyword?: string
  attractionId?: string
  venueId?: string
  postalCode?: string
  latlong?: string // "lat,long"
  radius?: number
  unit?: 'miles' | 'km'
  source?: 'ticketmaster' | 'universe' | 'frontgate' | 'tmr'
  locale?: string
  marketId?: string
  startDateTime?: string // ISO 8601
  endDateTime?: string // ISO 8601
  includeTBA?: 'yes' | 'no' | 'only'
  includeTBD?: 'yes' | 'no' | 'only'
  includeTest?: 'yes' | 'no' | 'only'
  size?: number // max 200
  page?: number
  sort?: TmEventSortOption
  classificationName?: string
  classificationId?: string
  segmentId?: string
  segmentName?: string
  genreId?: string
  subGenreId?: string
  typeId?: string
  subTypeId?: string
  countryCode?: string
  stateCode?: string
  city?: string
  onsaleOnStartDate?: boolean
  onsaleStartDateTime?: string
  onsaleEndDateTime?: string
}

// ─────────────────────────────────────────────
// App-level Types (UI / Pinia store)
// ─────────────────────────────────────────────

/** Lightweight shape used in event cards and list views */
export interface EventCard {
  id: string
  name: string
  url: string
  image: string | null
  date: string | null // localDate "YYYY-MM-DD"
  time: string | null // localTime "HH:mm:ss"
  dateTime: string | null // ISO 8601
  status: TmEventDates['status']['code'] | null
  city: string | null
  venueName: string | null
  segment: string | null // e.g. "Music", "Sports"
  genre: string | null
  priceMin: number | null
  priceMax: number | null
  currency: string | null
}

/** Full shape used in event detail page */
export interface EventDetail extends EventCard {
  description: string | null
  additionalInfo: string | null
  pleaseNote: string | null
  venue: TmVenue | null
  attractions: TmAttraction[]
  priceRanges: TmPriceRange[]
  seatmapUrl: string | null
  sales: TmSales | null
  classifications: TmClassification[]
}

/** Filter bar state */
export interface EventFilters {
  keyword: string
  city: string
  countryCode: string
  classificationName: string
  startDateTime: string | null
  endDateTime: string | null
  sort: TmEventSortOption
}

/** Pagination state for Pinia / composables */
export interface PaginationState {
  page: number
  size: number
  totalElements: number
  totalPages: number
}

/** Favorites store state */
export interface FavoritesState {
  ids: string[]
}

/** Generic async composable state */
export type AsyncState<T>
  = | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'success', data: T }
    | { status: 'error', message: string }
