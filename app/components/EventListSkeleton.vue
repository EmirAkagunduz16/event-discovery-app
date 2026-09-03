<script lang="ts" setup>
withDefaults(
  defineProps<{ count?: number }>(),
  { count: 12 },
)
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    <UCard
      v-for="n in count"
      :key="n"
      :ui="{ header: 'p-0 sm:p-0' }"
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
</template>
