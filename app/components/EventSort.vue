<script lang="ts" setup>
import type { TmEventSortOption } from '~~/types/event'

interface SortOption {
  label: string
  value: TmEventSortOption
}

withDefaults(
  defineProps<{
    modelValue?: TmEventSortOption
  }>(),
  {
    modelValue: 'date,asc',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: TmEventSortOption]
  'change': [value: TmEventSortOption]
}>()

const sortOptions: SortOption[] = [
  { label: 'Tarihe göre (Yakın → Uzak)', value: 'date,asc' },
  { label: 'Tarihe göre (Uzak → Yakın)', value: 'date,desc' },
  { label: 'İsme göre (A-Z)', value: 'name,asc' },
  { label: 'İsme göre (Z-A)', value: 'name,desc' },
  { label: 'İlgiye göre', value: 'relevance,desc' },
]

function onSelect(val: string | undefined) {
  const selected = (val as TmEventSortOption) || 'date,asc'
  emit('update:modelValue', selected)
  emit('change', selected)
}
</script>

<template>
  <div class="flex items-center gap-2">
    <span class="text-xs text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap hidden sm:inline">
      Sırala:
    </span>
    <USelect
      :model-value="modelValue || 'date,asc'"
      :items="sortOptions"
      icon="i-lucide-arrow-up-down"
      size="md"
      class="w-56"
      @update:model-value="onSelect"
    />
  </div>
</template>
