<script lang="ts" setup>
import { formatCategory } from '~/utils/formatters'

const props = defineProps<{
  category: string
  startDate: string
  endDate: string
}>()

const emit = defineEmits<{
  'update:category': [value: string]
  'update:startDate': [value: string]
  'update:endDate': [value: string]
}>()

const { classifications, getClassifications } = useClassifications()
onMounted(getClassifications)

const categoryOptions = computed(() => [
  { label: 'Tüm Kategoriler', value: 'all' },
  ...classifications.value.map(c => ({
    label: formatCategory(c.name) ?? c.name,
    value: c.name,
  })),
])

function onCategorySelect(val: string | undefined) {
  if (!val || val === 'all')
    emit('update:category', '')
  else
    emit('update:category', val)
}

const dateError = ref('')

function onStartDate(e: Event) {
  const val = (e.target as HTMLInputElement).value
  if (props.endDate && val > props.endDate) {
    dateError.value = 'Bitiş tarihi başlangıç tarihinden önce olamaz'
    return
  }
  dateError.value = ''
  emit('update:startDate', val)
}

function onEndDate(e: Event) {
  const val = (e.target as HTMLInputElement).value
  if (props.startDate && val < props.startDate) {
    dateError.value = 'Bitiş tarihi başlangıç tarihinden önce olamaz'
    return
  }
  dateError.value = ''
  emit('update:endDate', val)
}
</script>

<template>
  <div class="flex flex-col gap-4 w-full">
    <div class="space-y-1.5">
      <label class="text-xs font-semibold text-gray-500 dark:text-gray-400">Kategori</label>
      <USelect
        :model-value="category || 'all'"
        :items="categoryOptions"
        size="md"
        class="w-full"
        @update:model-value="onCategorySelect"
      />
    </div>

    <div class="space-y-1.5">
      <label class="text-xs font-semibold text-gray-500 dark:text-gray-400">Tarih Aralığı</label>
      <div class="flex flex-col sm:flex-row lg:flex-col gap-2">
        <div class="flex-1">
          <input
            :value="startDate"
            type="date"
            class="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:[color-scheme:dark]"
            @change="onStartDate"
          >
        </div>
        <div class="flex-1">
          <input
            :value="endDate"
            type="date"
            class="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:[color-scheme:dark]"
            @change="onEndDate"
          >
        </div>
      </div>
      <p v-if="dateError" class="text-xs text-red-500 dark:text-red-400">
        {{ dateError }}
      </p>
    </div>
  </div>
</template>
