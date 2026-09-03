<script lang="ts" setup>
const { loading, error, data, getEvents } = useEvents()

function fetchUpcomingEvents() {
  getEvents({ size: 12, sort: 'date,asc' })
}

// İlk açılışta veriyi hemen tetikle
fetchUpcomingEvents()

const events = computed(() => data.value?._embedded?.events ?? [])
</script>

<template>
  <UContainer class="py-12 space-y-10">
    <!-- Hero / Başlık Alanı -->
    <div class="text-center max-w-2xl mx-auto space-y-3">
      <UBadge
        label="Canlı Etkinlik Keşfi"
        color="primary"
        variant="subtle"
        size="md"
        class="rounded-full px-3 py-1 font-medium"
      />
      <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight">
        Yaklaşan Etkinlikler
      </h1>
      <p class="text-base text-gray-500 dark:text-gray-400">
        Konserler, tiyatrolar, spor karşılaşmaları ve popüler tüm etkinlikleri keşfetmeye başla.
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
      class="flex justify-center pt-4"
    >
      <UButton
        to="/events"
        label="Tüm Etkinlikleri Keşfet"
        size="xl"
        color="primary"
        variant="solid"
        trailing-icon="i-lucide-arrow-right"
        class="w-full sm:w-auto justify-center px-8 shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 transition-all min-h-11"
      />
    </div>
  </UContainer>
</template>
