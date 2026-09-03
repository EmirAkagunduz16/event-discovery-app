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
    <!-- Loading -->
    <EventListSkeleton v-if="loading" :count="skeletonCount" />

    <!-- Error -->
    <EventError
      v-else-if="error"
      :message="error"
      @retry="emit('retry')"
    />

    <!-- Empty -->
    <div
      v-else-if="!loading && !error && events.length === 0"
      class="py-12"
    >
      <UEmpty
        icon="i-lucide-search-x"
        title="Yaklaşan etkinlik bulunamadı"
        description="Şu anda görüntülenecek etkinlik bulunmuyor. Lütfen daha sonra tekrar deneyin."
      />
    </div>

    <!-- Data: Kart grid -->
    <div
      v-else
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      <EventCard
        v-for="event in events"
        :key="event.id"
        :event="event"
      />
    </div>
  </div>
</template>
