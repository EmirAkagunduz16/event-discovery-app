<script lang="ts" setup>
import type { TmEvent } from '~~/types/event'
import { useFavoritesStore } from '~~/stores/favorites'
import { formatCategory, formatEventDate } from '~/utils/formatters'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const event = ref<TmEvent | null>(null)
const errorType = ref<null | 'not_found' | 'general'>(null)
const errorMessage = ref<string | null>(null)

async function fetchEvent(id: string) {
  loading.value = true
  event.value = null
  errorType.value = null
  errorMessage.value = null

  try {
    event.value = await $fetch<TmEvent>(`/api/events/${id}`)
  }
  catch (err: unknown) {
    const e = err as { statusCode?: number, statusMessage?: string }
    if (e?.statusCode === 404) {
      errorType.value = 'not_found'
    }
    else {
      errorType.value = 'general'
      errorMessage.value = e?.statusMessage ?? 'Bir şeyler ters gitti.'
    }
  }
  finally {
    loading.value = false
  }
}

watch(
  () => route.params.id as string,
  (id) => {
    if (id)
      fetchEvent(id)
  },
  { immediate: true },
)

const galleryImages = computed(() => {
  const imgs = event.value?.images ?? []
  const nonFallback = imgs.filter(img => !img.fallback)
  const source = nonFallback.length > 0 ? nonFallback : imgs

  const byRatio = new Map<string, typeof source[number]>()
  for (const img of source) {
    const key = img.ratio ?? 'unknown'
    const existing = byRatio.get(key)
    if (!existing || (img.width ?? 0) > (existing.width ?? 0)) {
      byRatio.set(key, img)
    }
  }

  const result = [...byRatio.values()]
  result.sort((a, b) => {
    if (a.ratio === '16_9')
      return -1
    if (b.ratio === '16_9')
      return 1
    return 0
  })
  return result
})

const statusBadge = computed(() => {
  const code = event.value?.dates?.status?.code
  if (!code)
    return null
  const map: Record<string, { label: string, color: 'success' | 'neutral' | 'error' | 'warning' }> = {
    onsale: { label: 'Biletler Satışta', color: 'success' },
    offsale: { label: 'Satış Kapandı', color: 'neutral' },
    canceled: { label: 'İptal Edildi', color: 'error' },
    postponed: { label: 'Ertelendi', color: 'warning' },
    rescheduled: { label: 'Yeniden Planlandı', color: 'warning' },
  }
  return map[code] ?? null
})

const formattedStart = computed(() =>
  formatEventDate(
    event.value?.dates?.start?.localDate,
    event.value?.dates?.start?.localTime,
  ),
)

const formattedEnd = computed(() =>
  formatEventDate(
    event.value?.dates?.end?.localDate,
    event.value?.dates?.end?.localTime,
  ),
)

const priceRanges = computed(() => event.value?.priceRanges ?? [])

const venues = computed(() => event.value?._embedded?.venues ?? [])

function venueAddress(v: NonNullable<typeof venues.value>[number]) {
  return [v.address?.line1, v.address?.line2].filter(Boolean).join(', ')
}

function venueLocality(v: NonNullable<typeof venues.value>[number]) {
  return [v.city?.name, v.state?.name, v.country?.name].filter(Boolean).join(', ')
}

function venueThumbnail(v: NonNullable<typeof venues.value>[number]) {
  const imgs = v.images ?? []
  return imgs.sort((a, b) => (a.width ?? 0) - (b.width ?? 0))[0]?.url ?? null
}

function mapsUrl(lat: string, lng: string) {
  return `https://www.google.com/maps?q=${lat},${lng}`
}

const attractions = computed(() => event.value?._embedded?.attractions ?? [])

function attractionImage(attraction: NonNullable<typeof attractions.value>[number]) {
  const imgs = attraction.images ?? []
  const sorted = [...imgs]
    .filter(i => !i.fallback)
    .sort((a, b) => (b.width ?? 0) - (a.width ?? 0))
  return sorted[0]?.url ?? imgs[0]?.url ?? null
}

function attractionGenre(attraction: NonNullable<typeof attractions.value>[number]) {
  const cls = attraction.classifications?.find(c => c.primary) ?? attraction.classifications?.[0]
  return formatCategory(cls?.segment?.name) ?? cls?.genre?.name ?? null
}

const favoritesStore = useFavoritesStore()
const isFav = computed(() => event.value ? favoritesStore.isFavorite(event.value.id) : false)

function onToggleFavorite() {
  if (!event.value)
    return
  const e = event.value
  const price = e.priceRanges?.[0]
  const venue = e._embedded?.venues?.[0]
  favoritesStore.toggle({
    id: e.id,
    name: e.name,
    url: e.url,
    image: galleryImages.value[0]?.url ?? null,
    date: e.dates?.start?.localDate ?? null,
    time: e.dates?.start?.localTime ?? null,
    dateTime: e.dates?.start?.dateTime ?? null,
    status: e.dates?.status?.code ?? null,
    city: venue?.city?.name ?? null,
    venueName: venue?.name ?? null,
    segment: formatCategory(e.classifications?.find(c => c.primary)?.segment?.name) ?? null,
    genre: e.classifications?.[0]?.genre?.name ?? null,
    priceMin: price?.min ?? null,
    priceMax: price?.max ?? null,
    currency: price?.currency ?? null,
  })
}
</script>

<template>
  <div class="min-h-screen">
    <!-- ── LOADING ─────────────────────────────────────────────────────────── -->
    <EventDetailSkeleton v-if="loading" />

    <!-- ── ERROR ──────────────────────────────────────────────────────────── -->
    <EventDetailError
      v-else-if="errorType"
      :type="errorType"
      :message="errorMessage"
      @retry="fetchEvent(route.params.id as string)"
    />

    <div v-else-if="event" class="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <UButton
        icon="i-lucide-arrow-left"
        color="neutral"
        variant="ghost"
        label="Geri Dön"
        class="min-h-[44px] px-3"
        @click="router.back()"
      />

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <!-- Sol Kolon: Görseller, Açıklama, Sanatçılar (lg:col-span-7) -->
        <div class="lg:col-span-7 space-y-8">
          <!-- Görsel Galerisi -->
          <section>
            <div
              v-if="galleryImages.length === 0"
              class="w-full aspect-video rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400"
            >
              <UIcon name="i-lucide-image" class="w-16 h-16" />
            </div>

            <div
              v-else-if="galleryImages.length === 1"
              class="w-full aspect-video rounded-xl overflow-hidden shadow-sm"
            >
              <img
                :src="galleryImages[0]!.url"
                :alt="event.name"
                class="w-full h-full object-cover"
              >
            </div>

            <UCarousel
              v-else
              :items="galleryImages"
              arrows
              dots
              class="w-full rounded-xl overflow-hidden shadow-sm"
            >
              <template #default="{ item }">
                <div class="w-full aspect-video">
                  <img
                    :src="item.url"
                    :alt="event.name"
                    class="w-full h-full object-cover"
                  >
                </div>
              </template>
            </UCarousel>
          </section>

          <!-- Hakkında / Açıklama -->
          <section v-if="event.description" class="space-y-2">
            <h2 class="text-lg font-semibold">
              Hakkında
            </h2>
            <p class="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
              {{ event.description }}
            </p>
          </section>

          <!-- Sanatçılar & Katılımcılar -->
          <section v-if="attractions.length > 0" class="space-y-3">
            <h2 class="text-lg font-semibold">
              Sanatçılar & Katılımcılar
            </h2>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              <NuxtLink
                v-for="a in attractions"
                :key="a.id"
                :to="{ path: '/events', query: { keyword: a.name } }"
                class="flex flex-col items-center gap-2 text-center group cursor-pointer p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800/60 transition-colors"
              >
                <div class="w-16 h-16 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0 ring-2 ring-transparent group-hover:ring-primary-500 transition-all">
                  <img
                    v-if="attractionImage(a)"
                    :src="attractionImage(a)!"
                    :alt="a.name"
                    class="w-full h-full object-cover"
                  >
                  <div
                    v-else
                    class="w-full h-full flex items-center justify-center text-gray-400"
                  >
                    <UIcon name="i-lucide-user" class="w-7 h-7" />
                  </div>
                </div>
                <p
                  class="text-sm font-medium leading-tight group-hover:text-primary-500 transition-colors"
                >
                  {{ a.name }}
                </p>
                <p v-if="attractionGenre(a)" class="text-xs text-gray-500 dark:text-gray-400 -mt-1">
                  {{ attractionGenre(a) }}
                </p>
              </NuxtLink>
            </div>
          </section>
        </div>

        <!-- Sağ Kolon: Başlık, Durum, Tarih, Bilet, Fiyat, Mekan (lg:col-span-5) -->
        <div class="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          <!-- Ana Bilgi Kartı -->
          <UCard class="space-y-5">
            <div class="flex items-start gap-3">
              <h1 class="text-2xl font-bold flex-1 leading-snug">
                {{ event.name }}
              </h1>
              <UButton
                :color="isFav ? 'error' : 'neutral'"
                :variant="isFav ? 'solid' : 'outline'"
                icon="i-lucide-heart"
                size="md"
                class="shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
                :aria-label="isFav ? 'Favorilerden Çıkar' : 'Favorilere Ekle'"
                @click="onToggleFavorite"
              />
            </div>

            <div v-if="statusBadge">
              <UBadge
                :label="statusBadge.label"
                :color="statusBadge.color"
                variant="soft"
                size="md"
              />
            </div>

            <div class="space-y-2 pt-2 mt-2 border-t border-gray-100 dark:border-gray-800">
              <div v-if="formattedStart" class="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <UIcon name="i-lucide-calendar" class="w-5 h-5 shrink-0 text-primary-500" />
                <span class="font-medium text-sm sm:text-base">{{ formattedStart }}</span>
              </div>
              <div v-if="formattedEnd" class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <UIcon name="i-lucide-calendar-check" class="w-4 h-4 shrink-0" />
                <span>Bitiş: {{ formattedEnd }}</span>
              </div>
            </div>

            <!-- Bilet Satın Al Butonu -->
            <div v-if="event.url" class="pt-2">
              <UButton
                :to="event.url"
                target="_blank"
                rel="noopener noreferrer"
                icon="i-lucide-external-link"
                color="primary"
                variant="solid"
                size="lg"
                label="Bilet Satın Al"
                class="w-full justify-center min-h-[48px] font-semibold"
              />
            </div>

            <!-- Bilet Fiyatları -->
            <div v-if="priceRanges.length > 0" class="pt-3 border-t border-gray-100 dark:border-gray-800 space-y-2">
              <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Bilet Fiyatları
              </h3>
              <ul class="space-y-1">
                <li
                  v-for="(range, idx) in priceRanges"
                  :key="idx"
                  class="flex items-center justify-between text-xs sm:text-sm text-gray-700 dark:text-gray-300"
                >
                  <div class="flex items-center gap-1.5">
                    <UIcon name="i-lucide-ticket" class="w-4 h-4 text-primary-500 shrink-0" />
                    <span class="capitalize text-gray-500 dark:text-gray-400">{{ range.type }}</span>
                  </div>
                  <span class="font-semibold">
                    {{ range.min.toLocaleString() }} – {{ range.max.toLocaleString() }} {{ range.currency }}
                  </span>
                </li>
              </ul>
            </div>

            <!-- Önemli Not -->
            <div v-if="event.pleaseNote" class="pt-2">
              <UAlert
                icon="i-lucide-info"
                color="warning"
                variant="soft"
                title="Önemli Not"
                :description="event.pleaseNote"
              />
            </div>
          </UCard>

          <!-- Mekan Bilgisi Kartı (Mobilde tam genişlik) -->
          <section class="space-y-3">
            <h2 class="text-lg font-semibold">
              Mekan
            </h2>

            <p v-if="venues.length === 0" class="text-sm text-gray-500 dark:text-gray-400">
              Mekan bilgisi mevcut değil.
            </p>

            <UCard
              v-for="venue in venues"
              :key="venue.id"
              class="w-full"
            >
              <div class="flex gap-4">
                <div class="shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <img
                    v-if="venueThumbnail(venue)"
                    :src="venueThumbnail(venue)!"
                    :alt="venue.name"
                    class="w-full h-full object-cover"
                  >
                  <div
                    v-else
                    class="w-full h-full flex items-center justify-center text-gray-400"
                  >
                    <UIcon name="i-lucide-building-2" class="w-8 h-8" />
                  </div>
                </div>

                <div class="flex-1 min-w-0 space-y-1">
                  <p class="font-semibold truncate">
                    {{ venue.name }}
                  </p>
                  <p v-if="venueAddress(venue)" class="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {{ venueAddress(venue) }}
                  </p>
                  <p v-if="venueLocality(venue)" class="text-sm text-gray-500 dark:text-gray-500 truncate">
                    {{ venueLocality(venue) }}
                  </p>
                  <UButton
                    v-if="venue.location?.latitude && venue.location?.longitude"
                    :to="mapsUrl(venue.location.latitude, venue.location.longitude)"
                    target="_blank"
                    rel="noopener noreferrer"
                    icon="i-lucide-map-pin"
                    color="primary"
                    variant="link"
                    size="sm"
                    label="Haritada Gör"
                    class="p-0 min-h-[44px] inline-flex items-center"
                  />
                </div>
              </div>
            </UCard>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>
