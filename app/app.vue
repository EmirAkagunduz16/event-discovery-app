<script setup lang="ts">
import { useFavoritesStore } from '~~/stores/favorites'

const favoritesStore = useFavoritesStore()

onMounted(() => {
  favoritesStore.hydrate()
})
</script>

<template>
  <UApp>
    <NuxtPage />
  </UApp>
</template>
