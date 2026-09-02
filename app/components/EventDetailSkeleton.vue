<script lang="ts" setup>
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-8 space-y-6">
    <USkeleton class="w-full aspect-video rounded-xl" />

    <div class="flex items-start gap-3">
      <div class="flex-1 space-y-3">
        <USkeleton class="h-8 w-3/4" />
        <div class="flex gap-3">
          <USkeleton class="h-5 w-36" />
          <USkeleton class="h-5 w-24" />
        </div>
      </div>
      <USkeleton class="h-10 w-10 rounded-lg shrink-0" />
    </div>

    <div class="space-y-2">
      <USkeleton class="h-4 w-full" />
      <USkeleton class="h-4 w-full" />
      <USkeleton class="h-4 w-5/6" />
      <USkeleton class="h-4 w-4/6" />
    </div>

    <UCard class="flex gap-4">
      <template #header>
        <USkeleton class="h-5 w-24" />
      </template>
      <div class="flex gap-4">
        <USkeleton class="w-16 h-16 rounded-lg shrink-0" />
        <div class="flex-1 space-y-2">
          <USkeleton class="h-5 w-1/2" />
          <USkeleton class="h-4 w-3/4" />
          <USkeleton class="h-4 w-1/3" />
        </div>
      </div>
    </UCard>

    <div class="space-y-3">
      <USkeleton class="h-6 w-32" />
      <div class="flex gap-6">
        <div
          v-for="n in 3"
          :key="n"
          class="flex flex-col items-center gap-2"
        >
          <USkeleton class="w-16 h-16 rounded-full" />
          <USkeleton class="h-3 w-16" />
        </div>
      </div>
    </div>
  </div>
</template>
