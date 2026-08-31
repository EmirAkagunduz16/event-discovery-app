<script lang="ts" setup>
import type { TmEvent } from '~~/types/event'

withDefaults(
  defineProps<{
    events?: TmEvent[]
    loading?: boolean
    error?: string | null
    skeletonCount?: number
  }>(),
  {
    events: () => [],
    loading: false,
    error: null,
    skeletonCount: 12,
  },
)

const emit = defineEmits<{
  (e: 'retry'): void
}>()
</script>

<template>
  <div class="w-full">
    <!-- Loading: Skeleton grid -->
    <div
      v-if="loading"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <UCard
        v-for="n in skeletonCount"
        :key="n"
        class="overflow-hidden"
      >
        <template #header>
          <USkeleton class="w-full aspect-video" />
        </template>
        <div class="space-y-2">
          <USkeleton class="h-4 w-16" />
          <USkeleton class="h-5 w-full" />
          <USkeleton class="h-4 w-3/4" />
          <USkeleton class="h-4 w-1/2" />
          <USkeleton class="h-4 w-2/3" />
        </div>
      </UCard>
    </div>

    <!-- Error durumu -->
    <div v-else-if="error">
      <UAlert
        color="error"
        variant="soft"
        icon="i-lucide-circle-alert"
        :title="error"
      >
        <template #actions>
          <UButton
            color="error"
            variant="ghost"
            label="Tekrar Dene"
            @click="emit('retry')"
          />
        </template>
      </UAlert>
    </div>

    <!-- Empty durumu -->
    <div
      v-else-if="!loading && !error && events.length === 0"
      class="flex flex-col items-center justify-center py-20 text-gray-400 space-y-3"
    >
      <UIcon name="i-lucide-search-x" class="w-16 h-16" />
      <p class="text-lg">
        Yaklaşan etkinlik bulunamadı
      </p>
    </div>

    <!-- Data durumu: Kart grid -->
    <div
      v-else
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <EventCard
        v-for="event in events"
        :key="event.id"
        :event="event"
      />
    </div>
  </div>
</template>
