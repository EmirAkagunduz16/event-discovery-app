<script lang="ts" setup>
const { loading, error, data, getEvents } = useEvents()

// Sayfa mount olunca yaklaşan etkinlikleri yükle
onMounted(() => {
  getEvents({ size: 12, sort: 'date,asc' })
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

    <!-- Loading: Skeleton grid -->
    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <UCard v-for="n in 12" :key="n" class="overflow-hidden">
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
            @click="getEvents({ size: 12, sort: 'date,asc' })"
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

    <!-- Kart grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <EventCard
        v-for="event in events"
        :key="event.id"
        :event="event"
      />
    </div>

    <!-- Tüm Etkinlikleri Gör butonu -->
    <div v-if="!loading && events.length > 0" class="flex justify-center">
      <UButton
        to="/events"
        label="Tüm Etkinlikleri Gör"
        size="lg"
        trailing-icon="i-lucide-arrow-right"
      />
    </div>
  </div>
</template>
