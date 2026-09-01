<script lang="ts" setup>
const emit = defineEmits<{
  (e: 'update:city', value: string): void
  (e: 'update:category', value: string): void
  (e: 'update:startDate', value: string): void
  (e: 'update:endDate', value: string): void
  (e: 'clear-all'): void
}>()

const props = defineProps<{
  city: string
  category: string
  startDate: string
  endDate: string
}>()

const CITIES = [
  { label: 'Tüm Şehirler', value: '' },
  { label: 'Istanbul', value: 'Istanbul' },
  { label: 'Ankara', value: 'Ankara' },
  { label: 'Izmir', value: 'Izmir' },
  { label: 'Bursa', value: 'Bursa' },
  { label: 'Antalya', value: 'Antalya' },
  { label: 'Adana', value: 'Adana' },
  { label: 'Konya', value: 'Konya' },
]

const { classifications, getClassifications } = useClassifications()

onMounted(() => getClassifications())

const categoryOptions = computed(() => [
  { label: 'Tüm Kategoriler', value: '' },
  ...classifications.value.map(c => ({ label: c.name, value: c.name })),
])

const dateError = ref('')

function onStartDateChange(e: Event) {
  const val = (e.target as HTMLInputElement).value
  if (props.endDate && val > props.endDate) {
    dateError.value = 'Bitiş tarihi başlangıç tarihinden önce olamaz'
    return
  }
  dateError.value = ''
  emit('update:startDate', val)
}

function onEndDateChange(e: Event) {
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
  <div class="flex flex-wrap gap-3 items-end">
    <USelect
      :model-value="city"
      :options="CITIES"
      option-attribute="label"
      value-attribute="value"
      size="md"
      class="w-44"
      @update:model-value="(v) => emit('update:city', String(v ?? ''))"
    />

    <USelect
      :model-value="category"
      :options="categoryOptions"
      option-attribute="label"
      value-attribute="value"
      size="md"
      class="w-48"
      @update:model-value="(v) => emit('update:category', String(v ?? ''))"
    />

    <div class="flex flex-col gap-1">
      <div class="flex gap-2 items-center">
        <input
          :value="startDate"
          type="date"
          class="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          @change="onStartDateChange"
        >
        <span class="text-xs text-gray-400">—</span>
        <input
          :value="endDate"
          type="date"
          class="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          @change="onEndDateChange"
        >
      </div>
      <p v-if="dateError" class="text-xs text-red-500 dark:text-red-400">
        {{ dateError }}
      </p>
    </div>
  </div>
</template>
