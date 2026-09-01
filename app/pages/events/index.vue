<script lang="ts" setup>
import type { TmEventSortOption } from '~~/types/event'

useHead({ title: 'Etkinlikler | Event Discovery' })

const route = useRoute()
const router = useRouter()

const { loading, error, data, getEvents } = useEvents()

const events = computed(() => data.value?._embedded?.events ?? [])
const pageInfo = computed(() => data.value?.page ?? null)

const q = computed(() => ({
  keyword: (route.query.keyword as string) ?? '',
  category: (route.query.category as string) ?? '',
  startDate: (route.query.startDate as string) ?? '',
  endDate: (route.query.endDate as string) ?? '',
  sort: ((route.query.sort as TmEventSortOption) ?? 'date,asc'),
  page: Math.max(1, Number(route.query.page) || 1),
}))

const hasActiveFilters = computed(
  () => !!(q.value.keyword || q.value.category || q.value.startDate || q.value.endDate),
)

const dateChipLabel = computed(() => {
  const fmt = (s: string) => s.split('-').reverse().join('.')
  if (q.value.startDate && q.value.endDate)
    return `${fmt(q.value.startDate)} — ${fmt(q.value.endDate)}`
  if (q.value.startDate)
    return `${fmt(q.value.startDate)} →`
  if (q.value.endDate)
    return `→ ${fmt(q.value.endDate)}`
  return ''
})

function toLocalISO(date: string, time: string) {
  return new Date(`${date}T${time}`).toISOString()
}

function fetchEvents() {
  getEvents({
    keyword: q.value.keyword || undefined,
    classificationName: q.value.category || undefined,
    startDateTime: q.value.startDate ? toLocalISO(q.value.startDate, '00:00:00') : undefined,
    endDateTime: q.value.endDate ? toLocalISO(q.value.endDate, '23:59:59') : undefined,
    sort: q.value.sort,
    page: q.value.page - 1,
    size: 12,
  })
}

watch(() => route.query, fetchEvents, { immediate: true })

function updateFilters(patch: Record<string, string | number | undefined>) {
  router.push({ query: { ...route.query, ...patch, page: 1 } })
}

function updatePage(n: number) {
  router.push({ query: { ...route.query, page: n } })
}

function clearAllFilters() {
  router.push({ query: { sort: q.value.sort, page: 1 } })
}
</script>

<template>
  <UContainer class="py-8 space-y-6">
    <div class="flex items-start justify-between gap-4">
      <div class="space-y-1">
        <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Tüm Etkinlikler
        </h1>
        <p v-if="!loading && pageInfo" class="text-sm text-gray-500 dark:text-gray-400">
          Toplam
          <span class="font-semibold text-gray-700 dark:text-gray-200">
            {{ pageInfo.totalElements.toLocaleString('tr-TR') }}
          </span>
          etkinlik bulundu
        </p>
      </div>
      <UButton
        to="/"
        icon="i-lucide-arrow-left"
        label="Ana Sayfa"
        color="neutral"
        variant="ghost"
        size="sm"
        class="shrink-0"
      />
    </div>

    <EventSearch
      :model-value="q.keyword"
      @search="kw => updateFilters({ keyword: kw || undefined })"
    />

    <EventFilters
      :category="q.category"
      :start-date="q.startDate"
      :end-date="q.endDate"
      @update:category="updateFilters({ category: $event || undefined })"
      @update:start-date="updateFilters({ startDate: $event || undefined })"
      @update:end-date="updateFilters({ endDate: $event || undefined })"
    />

    <div v-if="hasActiveFilters" class="flex flex-wrap gap-2 items-center">
      <UBadge v-if="q.keyword" color="primary" variant="soft" :label="`Arama: ${q.keyword}`">
        <template #trailing>
          <UButton icon="i-lucide-x" size="xs" color="primary" variant="ghost" class="-mr-1" @click="updateFilters({ keyword: undefined })" />
        </template>
      </UBadge>

      <UBadge v-if="q.category" color="primary" variant="soft" :label="q.category">
        <template #trailing>
          <UButton icon="i-lucide-x" size="xs" color="primary" variant="ghost" class="-mr-1" @click="updateFilters({ category: undefined })" />
        </template>
      </UBadge>

      <UBadge v-if="q.startDate || q.endDate" color="primary" variant="soft" :label="dateChipLabel">
        <template #trailing>
          <UButton icon="i-lucide-x" size="xs" color="primary" variant="ghost" class="-mr-1" @click="updateFilters({ startDate: undefined, endDate: undefined })" />
        </template>
      </UBadge>

      <UButton size="xs" color="neutral" variant="ghost" label="Tümünü Temizle" icon="i-lucide-filter-x" @click="clearAllFilters" />
    </div>

    <EventList
      v-if="loading || error || events.length > 0"
      :events="events"
      :loading="loading"
      :error="error"
      :skeleton-count="12"
      @retry="fetchEvents"
    />

    <UEmpty
      v-else
      icon="i-lucide-search-x"
      :title="hasActiveFilters ? 'Aramanıza uygun etkinlik bulunamadı' : 'Şu an gösterilecek etkinlik yok'"
      :description="hasActiveFilters ? 'Farklı filtreler deneyebilir veya tüm filtreleri temizleyebilirsiniz.' : 'Lütfen daha sonra tekrar deneyin.'"
    >
      <template v-if="hasActiveFilters" #actions>
        <UButton label="Filtreleri Temizle" color="primary" variant="soft" icon="i-lucide-filter-x" @click="clearAllFilters" />
      </template>
    </UEmpty>

    <div
      v-if="!loading && !error && pageInfo && pageInfo.totalPages > 1"
      class="flex items-center justify-center gap-4 pt-4"
    >
      <UButton icon="i-lucide-chevron-left" :disabled="q.page <= 1" color="neutral" variant="soft" aria-label="Önceki sayfa" @click="updatePage(q.page - 1)" />
      <span class="text-sm text-gray-600 dark:text-gray-300 font-medium">
        {{ q.page }} / {{ pageInfo.totalPages }}
      </span>
      <UButton icon="i-lucide-chevron-right" :disabled="q.page >= pageInfo.totalPages" color="neutral" variant="soft" aria-label="Sonraki sayfa" @click="updatePage(q.page + 1)" />
    </div>
  </UContainer>
</template>
