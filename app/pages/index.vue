<script lang="ts" setup>
const { loading, error, data, getEvents } = useEvents()

function fetchUpcomingEvents() {
  getEvents({ size: 12, sort: 'date,asc' })
}

onMounted(() => {
  fetchUpcomingEvents()
})

const events = computed(() => data.value?._embedded?.events ?? [])
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-10 space-y-8">
    <!-- Başlık -->
    <div class="text-center space-y-2">
      <h1 class="text-3xl font-bold">
        Yaklaşan Etkinlikler
      </h1>
      <p class="text-gray-500 dark:text-gray-400">
        Bugünden itibaren en popüler etkinlikleri keşfet
      </p>
    </div>

    <!-- Etkinlik Listesi -->
    <EventList
      :events="events"
      :loading="loading"
      :error="error"
      :skeleton-count="12"
      @retry="fetchUpcomingEvents"
    />

    <!-- Tüm Etkinlikleri Gör butonu -->
    <div
      v-if="!loading && !error && events.length > 0"
      class="flex justify-center"
    >
      <UButton
        to="/events"
        label="Tüm Etkinlikleri Gör"
        size="lg"
        trailing-icon="i-lucide-arrow-right"
      />
    </div>
  </div>
</template>
