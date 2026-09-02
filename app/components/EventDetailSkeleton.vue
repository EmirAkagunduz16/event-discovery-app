<script lang="ts" setup>
// Detay sayfası için loading skeleton — detay layout'unu taklit eder
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-8 space-y-6 animate-pulse">
    <!-- Görsel alanı -->
    <div class="w-full aspect-video rounded-xl bg-gray-200 dark:bg-gray-800" />

    <!-- Başlık + meta -->
    <div class="space-y-3">
      <div class="h-8 bg-gray-200 dark:bg-gray-800 rounded-lg w-3/4" />
      <div class="flex gap-3">
        <div class="h-5 bg-gray-200 dark:bg-gray-800 rounded w-36" />
        <div class="h-5 bg-gray-200 dark:bg-gray-800 rounded w-24" />
      </div>
    </div>

    <!-- Açıklama -->
    <div class="space-y-2">
      <div class="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full" />
      <div class="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full" />
      <div class="h-4 bg-gray-200 dark:bg-gray-800 rounded w-5/6" />
      <div class="h-4 bg-gray-200 dark:bg-gray-800 rounded w-4/6" />
    </div>

    <!-- Mekan -->
    <div class="border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex gap-4">
      <div class="w-16 h-16 rounded-lg bg-gray-200 dark:bg-gray-800 shrink-0" />
      <div class="flex-1 space-y-2">
        <div class="h-5 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
        <div class="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
        <div class="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
      </div>
    </div>

    <!-- Sanatçılar -->
    <div class="space-y-3">
      <div class="h-6 bg-gray-200 dark:bg-gray-800 rounded w-32" />
      <div class="flex gap-4">
        <div
          v-for="n in 3"
          :key="n"
          class="flex flex-col items-center gap-2"
        >
          <div class="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-800" />
          <div class="h-3 bg-gray-200 dark:bg-gray-800 rounded w-16" />
        </div>
      </div>
    </div>
  </div>
</template>
