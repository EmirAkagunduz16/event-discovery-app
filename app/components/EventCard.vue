<script lang="ts" setup>
import type { TmEvent } from '~~/types/event'
import { useFavoritesStore } from '~~/stores/favorites'
import { formatEventDate } from '~/utils/formatters'

const props = defineProps<{
  event: TmEvent
}>()

const favoritesStore = useFavoritesStore()

// En yüksek kaliteli 16:9 görseli seç (genişliğe göre sırala)
const image = computed(() => {
  const images = props.event.images ?? []

  const ratio169 = images
    .filter(img => img.ratio === '16_9' && !img.fallback)
    .sort((a, b) => (b.width ?? 0) - (a.width ?? 0))
  if (ratio169.length > 0) {
    return ratio169[0]?.url
  }

  const nonFallback = images
    .filter(img => !img.fallback)
    .sort((a, b) => (b.width ?? 0) - (a.width ?? 0))
  if (nonFallback.length > 0) {
    return nonFallback[0]?.url
  }

  return images[0]?.url ?? null
})

// Tarih + saat formatı: "25 Aralık 2024, 19:30"
const formattedDate = computed(() => {
  return formatEventDate(
    props.event.dates?.start?.localDate,
    props.event.dates?.start?.localTime,
  )
})

const venue = computed(() => props.event._embedded?.venues?.[0] ?? null)
const city = computed(() => venue.value?.city?.name ?? null)
const venueName = computed(() => venue.value?.name ?? null)

const category = computed(() => {
  const cls = props.event.classifications?.find(c => c.primary) ?? props.event.classifications?.[0]
  return cls?.segment?.name ?? null
})

const isFav = computed(() => favoritesStore.isFavorite(props.event.id))

function onToggleFavorite() {
  const price = props.event.priceRanges?.[0]
  favoritesStore.toggle({
    id: props.event.id,
    name: props.event.name,
    url: props.event.url,
    image: image.value,
    date: props.event.dates?.start?.localDate ?? null,
    time: props.event.dates?.start?.localTime ?? null,
    dateTime: props.event.dates?.start?.dateTime ?? null,
    status: props.event.dates?.status?.code ?? null,
    city: city.value,
    venueName: venueName.value,
    segment: category.value,
    genre: props.event.classifications?.[0]?.genre?.name ?? null,
    priceMin: price?.min ?? null,
    priceMax: price?.max ?? null,
    currency: price?.currency ?? null,
  })
}
</script>

<template>
  <NuxtLink :to="`/events/${event.id}`" class="block h-full group">
    <UCard
      :ui="{
        header: 'p-0 sm:p-0',
        body: 'p-4 sm:p-5 flex-1 flex flex-col justify-between',
      }"
      class="h-full overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:ring-1 hover:ring-primary-500/40"
    >
      <!-- Görsel Alanı -->
      <template #header>
        <div class="relative aspect-video w-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
          <img
            v-if="image"
            :src="image"
            :alt="event.name"
            loading="lazy"
            class="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          >
          <div
            v-else
            class="w-full h-full flex items-center justify-center text-gray-400"
          >
            <UIcon name="i-lucide-image" class="w-12 h-12" />
          </div>

          <!-- Kategori Rozeti (Görsel üzerinde yüzen) -->
          <div v-if="category" class="absolute top-3 left-3">
            <UBadge
              :label="category"
              color="primary"
              variant="solid"
              size="xs"
              class="shadow-md backdrop-blur-md"
            />
          </div>

          <!-- Favori Butonu (Görsel üzerinde yüzen) -->
          <UButton
            class="absolute top-3 right-3 rounded-full shadow-md backdrop-blur-sm"
            :color="isFav ? 'error' : 'neutral'"
            :variant="isFav ? 'solid' : 'soft'"
            :icon="isFav ? 'i-lucide-heart' : 'i-lucide-heart'"
            size="xs"
            :aria-label="isFav ? 'Favorilerden Çıkar' : 'Favorilere Ekle'"
            @click.stop.prevent="onToggleFavorite"
          />
        </div>
      </template>

      <!-- İçerik Alanı -->
      <div class="space-y-3 flex-1 flex flex-col justify-between">
        <div class="space-y-2">
          <!-- Etkinlik Adı -->
          <h3 class="font-bold text-base leading-snug line-clamp-2 group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors">
            {{ event.name }}
          </h3>

          <!-- Tarih & Saat -->
          <div v-if="formattedDate" class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 font-medium">
            <UIcon name="i-lucide-calendar" class="w-4 h-4 shrink-0 text-primary-500" />
            <span>{{ formattedDate }}</span>
          </div>
        </div>

        <!-- Konum & Mekan -->
        <div class="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-1 text-xs text-gray-500 dark:text-gray-400">
          <div v-if="city" class="flex items-center gap-1.5">
            <UIcon name="i-lucide-map-pin" class="w-3.5 h-3.5 shrink-0 text-gray-400" />
            <span class="truncate">{{ city }}</span>
          </div>

          <div v-if="venueName" class="flex items-center gap-1.5">
            <UIcon name="i-lucide-building-2" class="w-3.5 h-3.5 shrink-0 text-gray-400" />
            <span class="truncate">{{ venueName }}</span>
          </div>
        </div>
      </div>
    </UCard>
  </NuxtLink>
</template>
