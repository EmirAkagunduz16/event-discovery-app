<script lang="ts" setup>
import type { TmEvent } from '~~/types/event'
import { useFavoritesStore } from '~~/stores/favorites'
import { formatEventDate } from '~/utils/formatters'

const props = defineProps<{
  event: TmEvent
}>()

const favoritesStore = useFavoritesStore()

// Gösterilecek en iyi görsel (16:9 oranını tercih et, fallback olmayanı al)
const image = computed(() => {
  const images = props.event.images ?? []
  return (
    images.find(img => img.ratio === '16_9' && !img.fallback)?.url
    ?? images[0]?.url
    ?? null
  )
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
  <NuxtLink :to="`/events/${event.id}`" class="block h-full">
    <UCard class="h-full hover:shadow-lg transition-shadow cursor-pointer overflow-hidden flex flex-col">
      <!-- Görsel -->
      <template #header>
        <div class="relative aspect-video bg-gray-100 dark:bg-gray-800 overflow-hidden">
          <img
            v-if="image"
            :src="image"
            :alt="event.name"
            class="w-full h-full object-cover"
          >
          <div
            v-else
            class="w-full h-full flex items-center justify-center text-gray-400"
          >
            <UIcon name="i-lucide-image" class="w-12 h-12" />
          </div>

          <!-- Favori Butonu -->
          <UButton
            class="absolute top-2 right-2 rounded-full"
            :color="isFav ? 'error' : 'neutral'"
            :variant="isFav ? 'solid' : 'soft'"
            :icon="isFav ? 'i-lucide-heart-crack' : 'i-lucide-heart'"
            size="sm"
            :aria-label="isFav ? 'Favorilerden Çıkar' : 'Favorilere Ekle'"
            @click.stop.prevent="onToggleFavorite"
          />
        </div>
      </template>

      <!-- İçerik -->
      <div class="space-y-2 flex-1">
        <!-- Kategori etiketi -->
        <UBadge
          v-if="category"
          :label="category"
          color="primary"
          variant="soft"
          size="xs"
        />

        <!-- Etkinlik adı -->
        <p class="font-bold text-base leading-tight line-clamp-2">
          {{ event.name }}
        </p>

        <!-- Tarih -->
        <div v-if="formattedDate" class="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
          <UIcon name="i-lucide-calendar" class="w-4 h-4 shrink-0" />
          <span>{{ formattedDate }}</span>
        </div>

        <!-- Şehir -->
        <div v-if="city" class="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
          <UIcon name="i-lucide-map-pin" class="w-4 h-4 shrink-0" />
          <span>{{ city }}</span>
        </div>

        <!-- Mekan -->
        <div v-if="venueName" class="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
          <UIcon name="i-lucide-building-2" class="w-4 h-4 shrink-0" />
          <span class="truncate">{{ venueName }}</span>
        </div>
      </div>
    </UCard>
  </NuxtLink>
</template>
