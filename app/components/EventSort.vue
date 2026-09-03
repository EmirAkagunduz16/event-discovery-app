<script lang="ts" setup>
import type { TmEventSortOption } from '~~/types/event'

interface SortOption {
  label: string
  value: TmEventSortOption
}

withDefaults(
  defineProps<{
    modelValue?: TmEventSortOption
    block?: boolean
  }>(),
  {
    modelValue: 'date,asc',
    block: false,
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
  <div class="flex items-center gap-2" :class="[block ? 'w-full flex-col items-start' : '']">
    <span class="text-xs text-gray-500 dark:text-gray-400 font-semibold whitespace-nowrap" :class="[block ? 'inline' : 'hidden sm:inline']">
      Sıralama
    </span>
    <USelect
      :model-value="modelValue || 'date,asc'"
      :items="sortOptions"
      icon="i-lucide-arrow-up-down"
      size="md"
      :class="block ? 'w-full' : 'w-full sm:w-56'"
      @update:model-value="onSelect"
    />
  </div>
</template>
