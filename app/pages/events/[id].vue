<script lang="ts" setup>
import type { TmEvent, TmImage } from '~~/types/event'
import { useFavoritesStore } from '~~/stores/favorites'
import { formatCategory, formatEventDate } from '~/utils/formatters'

// ─── Route ───────────────────────────────────────────────────────────────────
const route = useRoute()

// ─── State ───────────────────────────────────────────────────────────────────
const loading = ref(false)
const event = ref<TmEvent | null>(null)
const errorType = ref<null | 'not_found' | 'general'>(null)
const errorMessage = ref<string | null>(null)

// ─── Veri çekme ──────────────────────────────────────────────────────────────
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

// ─── D) Görsel galerisi ──────────────────────────────────────────────────────

/** Tüm görselleri büyükten küçüğe sırala, fallback olmayanları önce getir */
const sortedImages = computed<TmImage[]>(() => {
  const imgs = event.value?.images ?? []
  return [...imgs]
    .sort((a, b) => {
      if (a.fallback !== b.fallback)
        return a.fallback ? 1 : -1
      return (b.width ?? 0) - (a.width ?? 0)
    })
})

/** Aktif (büyük) görsel index'i */
const activeImageIndex = ref(0)
const activeImage = computed(() => sortedImages.value[activeImageIndex.value] ?? null)

// Etkinlik değişince index sıfırla
watch(event, () => { activeImageIndex.value = 0 })

// ─── D) Durum badge'i ────────────────────────────────────────────────────────
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

// ─── D) Tarih + saat ─────────────────────────────────────────────────────────
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

// ─── D) Fiyat aralığı ────────────────────────────────────────────────────────
const priceRanges = computed(() => event.value?.priceRanges ?? [])

// ─── E) Mekan ────────────────────────────────────────────────────────────────
const venues = computed(() => event.value?._embedded?.venues ?? [])

function venueAddress(v: NonNullable<typeof venues.value>[number]) {
  const parts = [v.address?.line1, v.address?.line2].filter(Boolean)
  return parts.join(', ')
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

// ─── F) Sanatçılar ───────────────────────────────────────────────────────────
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

// ─── G) Favori butonu ────────────────────────────────────────────────────────
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
    image: activeImage.value?.url ?? null,
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

    <!-- ── İÇERİK ─────────────────────────────────────────────────────────── -->
    <div v-else-if="event" class="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <!-- ── D) Görsel Galerisi ──────────────────────────────────────────── -->
      <section>
        <!-- Ana görsel -->
        <div class="w-full aspect-video rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
          <img
            v-if="activeImage"
            :src="activeImage.url"
            :alt="event.name"
            class="w-full h-full object-cover"
          >
          <div
            v-else
            class="w-full h-full flex items-center justify-center text-gray-400"
          >
            <UIcon name="i-lucide-image" class="w-16 h-16" />
          </div>
        </div>

        <!-- Thumbnail'ler (birden fazla görsel varsa) -->
        <div
          v-if="sortedImages.length > 1"
          class="flex gap-2 mt-2 overflow-x-auto pb-1"
        >
          <button
            v-for="(img, idx) in sortedImages"
            :key="img.url"
            type="button"
            class="shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all"
            :class="idx === activeImageIndex
              ? 'border-primary-500 opacity-100'
              : 'border-transparent opacity-60 hover:opacity-100'"
            @click="activeImageIndex = idx"
          >
            <img :src="img.url" :alt="`${event.name} ${idx + 1}`" class="w-full h-full object-cover">
          </button>
        </div>
      </section>

      <!-- ── D) Başlık + Meta ────────────────────────────────────────────── -->
      <section class="space-y-3">
        <div class="flex items-start gap-3">
          <h1 class="text-2xl sm:text-3xl font-bold flex-1">
            {{ event.name }}
          </h1>
          <!-- G) Favori Butonu -->
          <UButton
            :color="isFav ? 'error' : 'neutral'"
            :variant="isFav ? 'solid' : 'outline'"
            icon="i-lucide-heart"
            size="lg"
            :aria-label="isFav ? 'Favorilerden Çıkar' : 'Favorilere Ekle'"
            class="shrink-0 mt-1"
            @click="onToggleFavorite"
          />
        </div>

        <!-- Durum badge'i -->
        <div v-if="statusBadge">
          <UBadge
            :label="statusBadge.label"
            :color="statusBadge.color"
            variant="soft"
            size="lg"
          />
        </div>

        <!-- Tarih + saat -->
        <div v-if="formattedStart" class="flex items-center gap-2 text-gray-700 dark:text-gray-300">
          <UIcon name="i-lucide-calendar" class="w-5 h-5 shrink-0 text-primary-500" />
          <span class="font-medium">{{ formattedStart }}</span>
        </div>
        <div v-if="formattedEnd" class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <UIcon name="i-lucide-calendar-check" class="w-4 h-4 shrink-0" />
          <span>Bitiş: {{ formattedEnd }}</span>
        </div>
      </section>

      <!-- ── D) Açıklama ────────────────────────────────────────────────── -->
      <section v-if="event.description" class="space-y-2">
        <h2 class="text-lg font-semibold">
          Hakkında
        </h2>
        <p class="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
          {{ event.description }}
        </p>
      </section>

      <!-- ── D) Fiyat Aralığı ───────────────────────────────────────────── -->
      <section v-if="priceRanges.length > 0" class="space-y-2">
        <h2 class="text-lg font-semibold">
          Bilet Fiyatları
        </h2>
        <ul class="space-y-1">
          <li
            v-for="(range, idx) in priceRanges"
            :key="idx"
            class="flex items-center gap-2 text-gray-700 dark:text-gray-300"
          >
            <UIcon name="i-lucide-ticket" class="w-4 h-4 text-primary-500" />
            <span class="capitalize text-sm text-gray-500 dark:text-gray-400 w-32">{{ range.type }}</span>
            <span class="font-semibold">
              {{ range.min.toLocaleString() }} – {{ range.max.toLocaleString() }} {{ range.currency }}
            </span>
          </li>
        </ul>
      </section>

      <!-- ── D) Bilet Satın Al butonu ───────────────────────────────────── -->
      <section v-if="event.url">
        <UButton
          :to="event.url"
          target="_blank"
          rel="noopener noreferrer"
          icon="i-lucide-external-link"
          color="primary"
          variant="solid"
          size="lg"
          label="Bilet Satın Al"
        />
      </section>

      <!-- ── D) Please Note ────────────────────────────────────────────── -->
      <section v-if="event.pleaseNote">
        <UAlert
          icon="i-lucide-info"
          color="warning"
          variant="soft"
          title="Önemli Not"
          :description="event.pleaseNote"
        />
      </section>

      <!-- ── E) Mekan Bilgisi ───────────────────────────────────────────── -->
      <section class="space-y-3">
        <h2 class="text-lg font-semibold">
          Mekan
        </h2>

        <p v-if="venues.length === 0" class="text-sm text-gray-500 dark:text-gray-400">
          Mekan bilgisi mevcut değil.
        </p>

        <div
          v-for="venue in venues"
          :key="venue.id"
          class="border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex gap-4"
        >
          <!-- Mekan küçük görseli -->
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

          <!-- Mekan detayları -->
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
            <a
              v-if="venue.location?.latitude && venue.location?.longitude"
              :href="mapsUrl(venue.location.latitude, venue.location.longitude)"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1 text-sm text-primary-500 hover:underline mt-1"
            >
              <UIcon name="i-lucide-map-pin" class="w-4 h-4" />
              Haritada Gör
            </a>
          </div>
        </div>
      </section>

      <!-- ── F) Sanatçılar ──────────────────────────────────────────────── -->
      <section v-if="attractions.length > 0" class="space-y-3">
        <h2 class="text-lg font-semibold">
          Sanatçılar & Katılımcılar
        </h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          <component
            :is="a.url ? 'a' : 'div'"
            v-for="a in attractions"
            :key="a.id"
            v-bind="a.url ? { href: a.url, target: '_blank', rel: 'noopener noreferrer' } : {}"
            class="flex flex-col items-center gap-2 text-center group"
            :class="a.url ? 'cursor-pointer' : ''"
          >
            <!-- Sanatçı görseli -->
            <div class="w-16 h-16 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0">
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
            <!-- İsim -->
            <p class="text-sm font-medium leading-tight" :class="a.url ? 'group-hover:text-primary-500 transition-colors' : ''">
              {{ a.name }}
            </p>
            <!-- Kategori -->
            <p v-if="attractionGenre(a)" class="text-xs text-gray-500 dark:text-gray-400 -mt-1">
              {{ attractionGenre(a) }}
            </p>
          </component>
        </div>
      </section>
    </div>
  </div>
</template>
