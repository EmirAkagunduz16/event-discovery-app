<script lang="ts" setup>
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
  { label: 'Tüm Kategoriler', value: '' },
  ...classifications.value.map(c => ({ label: c.name, value: c.name })),
])

function onCategorySelect(val: string | undefined) {
  emit('update:category', val || '')
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
  <div class="flex flex-wrap gap-3 items-center">
    <USelect
      :model-value="category || ''"
      :items="categoryOptions"
      size="md"
      class="w-48"
      @update:model-value="onCategorySelect"
    />

    <div class="flex flex-col gap-1">
      <div class="flex gap-2 items-center">
        <input
          :value="startDate"
          type="date"
          class="h-8 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
          @change="onStartDate"
        >
        <span class="text-xs text-gray-400">—</span>
        <input
          :value="endDate"
          type="date"
          class="h-8 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
          @change="onEndDate"
        >
      </div>
      <p v-if="dateError" class="text-xs text-red-500 dark:text-red-400">
        {{ dateError }}
      </p>
    </div>
  </div>
</template>
