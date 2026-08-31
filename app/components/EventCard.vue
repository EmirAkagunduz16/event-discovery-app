<script lang="ts" setup>
import type { TmEvent } from '~~/types/event'

const props = defineProps<{
  event: TmEvent
}>()

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
  const { localDate, localTime } = props.event.dates.start
  if (!localDate) return null

  const date = new Date(localDate)
  const dateStr = date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  if (!localTime) return dateStr
  const [h, m] = localTime.split(':')
  return `${dateStr}, ${h}:${m}`
})

const venue = computed(() => props.event._embedded?.venues?.[0] ?? null)
const city = computed(() => venue.value?.city?.name ?? null)
const venueName = computed(() => venue.value?.name ?? null)

const category = computed(() => {
  const cls = props.event.classifications?.find(c => c.primary) ?? props.event.classifications?.[0]
  return cls?.segment?.name ?? null
})
</script>

<template>
  <NuxtLink :to="`/events/${event.id}`">
    <UCard class="h-full hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
      <!-- Görsel -->
      <template #header>
        <div class="aspect-video bg-gray-100 dark:bg-gray-800 overflow-hidden">
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
        </div>
      </template>

      <!-- İçerik -->
      <div class="space-y-2">
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
