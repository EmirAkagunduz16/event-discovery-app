<script lang="ts" setup>
defineProps<{
  type: 'not_found' | 'general'
  message?: string | null
}>()

const emit = defineEmits<{ (e: 'retry'): void }>()
</script>

<template>
  <UEmpty
    v-if="type === 'not_found'"
    icon="i-lucide-search-x"
    title="Aradığınız etkinlik bulunamadı"
    description="Etkinlik kaldırılmış veya link hatalı olabilir."
    class="py-24"
  >
    <template #actions>
      <UButton
        to="/events"
        icon="i-lucide-arrow-left"
        color="primary"
        variant="solid"
        label="Etkinliklere Dön"
      />
    </template>
  </UEmpty>

  <UEmpty
    v-else
    icon="i-lucide-wifi-off"
    title="Bir şeyler ters gitti"
    :description="message ?? 'Lütfen tekrar deneyin.'"
    class="py-24"
  >
    <template #actions>
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
    </template>
  </UEmpty>
</template>
