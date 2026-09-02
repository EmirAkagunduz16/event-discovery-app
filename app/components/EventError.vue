<script lang="ts" setup>
defineProps<{ message: string }>()

const emit = defineEmits<{ (e: 'retry'): void }>()
</script>

<template>
  <UAlert
    color="error"
    variant="soft"
    icon="i-lucide-circle-alert"
    :title="message"
  >
    <template #actions>
      <UButton
        color="error"
        variant="ghost"
        label="Tekrar Dene"
        @click="emit('retry')"
      />
    </template>
  </UAlert>
</template>
