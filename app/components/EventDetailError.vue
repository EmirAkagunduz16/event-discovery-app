<script lang="ts" setup>
defineProps<{
  type: 'not_found' | 'general'
  message?: string | null
}>()

const emit = defineEmits<{ (e: 'retry'): void }>()
</script>

<template>
  <div class="max-w-lg mx-auto px-4 py-24 flex flex-col items-center text-center gap-6">
    <!-- NOT FOUND -->
    <template v-if="type === 'not_found'">
      <div class="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <UIcon name="i-lucide-search-x" class="w-10 h-10 text-gray-400" />
      </div>
      <div class="space-y-2">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Aradığınız etkinlik bulunamadı
        </h1>
        <p class="text-gray-500 dark:text-gray-400">
          Etkinlik kaldırılmış veya link hatalı olabilir.
        </p>
      </div>
      <UButton
        to="/events"
        icon="i-lucide-arrow-left"
        color="primary"
        variant="solid"
        label="Etkinliklere Dön"
      />
    </template>

    <!-- GENERAL ERROR -->
    <template v-else>
      <div class="w-20 h-20 rounded-full bg-red-50 dark:bg-red-950 flex items-center justify-center">
        <UIcon name="i-lucide-wifi-off" class="w-10 h-10 text-red-400" />
      </div>
      <div class="space-y-2">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Bir şeyler ters gitti
        </h1>
        <p class="text-gray-500 dark:text-gray-400">
          {{ message ?? 'Lütfen tekrar deneyin.' }}
        </p>
      </div>
      <div class="flex gap-3">
        <UButton
          icon="i-lucide-refresh-cw"
          color="primary"
          variant="solid"
          label="Tekrar Dene"
          @click="emit('retry')"
        />
        <UButton
          to="/events"
          icon="i-lucide-arrow-left"
          color="neutral"
          variant="outline"
          label="Etkinliklere Dön"
        />
      </div>
    </template>
  </div>
</template>
