<script lang="ts" setup>
import { useFavoritesStore } from '~~/stores/favorites'

const favoritesStore = useFavoritesStore()
const favCount = computed(() => favoritesStore.count)
</script>

<template>
  <header class="sticky top-0 z-50 backdrop-blur-md bg-white/85 dark:bg-gray-950/85 border-b border-gray-200 dark:border-gray-800 transition-colors">
    <UContainer class="flex items-center justify-between h-16">
      <!-- Logo / Ana Sayfa Linki -->
      <NuxtLink
        to="/"
        class="flex items-center gap-2.5 font-extrabold text-lg tracking-tight text-gray-900 dark:text-white hover:text-primary-500 transition-colors"
      >
        <div class="w-8 h-8 rounded-lg bg-primary-500/10 dark:bg-primary-500/20 flex items-center justify-center text-primary-500">
          <UIcon name="i-lucide-sparkles" class="w-5 h-5" />
        </div>
        <span>Event Discovery</span>
      </NuxtLink>

      <!-- Navigasyon Menüsü -->
      <nav class="flex items-center gap-1 sm:gap-3">
        <UButton
          to="/"
          label="Ana Sayfa"
          variant="ghost"
          color="neutral"
          size="sm"
          icon="i-lucide-home"
        />

        <UButton
          to="/events"
          label="Etkinlikler"
          variant="ghost"
          color="neutral"
          size="sm"
          icon="i-lucide-calendar"
        />

        <UButton
          to="/favorites"
          variant="ghost"
          color="neutral"
          size="sm"
          icon="i-lucide-heart"
        >
          <span class="hidden sm:inline">Favoriler</span>
          <UBadge
            v-if="favCount > 0"
            :label="String(favCount)"
            size="xs"
            color="primary"
            variant="solid"
            class="rounded-full"
          />
        </UButton>
      </nav>
    </UContainer>
  </header>
</template>
