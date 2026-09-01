<script lang="ts" setup>
import type { TmEventSortOption } from '~~/types/event'

useHead({ title: 'Etkinlikler | Event Discovery' })

const route = useRoute()
const router = useRouter()

const { loading, error, data, getEvents } = useEvents()

const events = computed(() => data.value?._embedded?.events ?? [])
const pageInfo = computed(() => data.value?.page ?? null)

const queryKeyword = computed(() => (route.query.keyword as string) ?? '')
const queryCity = computed(() => (route.query.city as string) ?? '')
const queryCategory = computed(() => (route.query.category as string) ?? '')
const queryStartDate = computed(() => (route.query.startDate as string) ?? '')
const queryEndDate = computed(() => (route.query.endDate as string) ?? '')
const querySort = computed<TmEventSortOption>(
  () => (route.query.sort as TmEventSortOption) ?? 'date,asc',
)
const queryPage = computed(() => {
  const p = Number(route.query.page)
  return Number.isFinite(p) && p >= 1 ? p : 1
})

const hasActiveFilters = computed(
  () => !!(queryKeyword.value || queryCity.value || queryCategory.value || queryStartDate.value || queryEndDate.value),
)

function fetchEvents() {
  getEvents({
    keyword: queryKeyword.value || undefined,
    city: queryCity.value || undefined,
    classificationName: queryCategory.value || undefined,
    startDateTime: queryStartDate.value ? `${queryStartDate.value}T00:00:00Z` : undefined,
    endDateTime: queryEndDate.value ? `${queryEndDate.value}T23:59:59Z` : undefined,
    sort: querySort.value,
    page: queryPage.value - 1,
    size: 12,
  })
}

watch(() => route.query, () => fetchEvents(), { immediate: true })

function updateFilters(patch: Record<string, string | number | undefined>) {
  router.push({ query: { ...route.query, ...patch, page: 1 } })
}

function updatePage(newPage: number) {
  router.push({ query: { ...route.query, page: newPage } })
}

function clearAllFilters() {
  router.push({ query: { sort: querySort.value, page: 1 } })
}

function onSearch(keyword: string) {
  router.push({ query: { ...route.query, keyword: keyword.trim() || undefined, page: 1 } })
}

function onSearchClear() {
  const { keyword: _k, ...rest } = route.query
  router.push({ query: { ...rest, page: 1 } })
}

function onClearStartDate() {
  const { startDate: _s, ...rest } = route.query
  router.push({ query: { ...rest, page: 1 } })
}

function onClearEndDate() {
  const { endDate: _e, ...rest } = route.query
  router.push({ query: { ...rest, page: 1 } })
}

function formatDate(iso: string) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}.${m}.${y}`
}
</script>

<template>
  <UContainer class="py-8 space-y-6">
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

    <EventSearch :model-value="queryKeyword" @search="onSearch" @clear="onSearchClear" />

    <EventFilters
      :city="queryCity"
      :category="queryCategory"
      :start-date="queryStartDate"
      :end-date="queryEndDate"
      @update:city="updateFilters({ city: $event || undefined })"
      @update:category="updateFilters({ category: $event || undefined })"
      @update:start-date="updateFilters({ startDate: $event || undefined })"
      @update:end-date="updateFilters({ endDate: $event || undefined })"
      @clear-all="clearAllFilters"
    />

    <div v-if="hasActiveFilters" class="flex flex-wrap gap-2 items-center">
      <UBadge v-if="queryKeyword" color="primary" variant="soft" :label="`Arama: ${queryKeyword}`">
        <template #trailing>
          <UButton icon="i-lucide-x" size="xs" color="primary" variant="ghost" class="-mr-1" aria-label="Aramayı temizle" @click="onSearchClear" />
        </template>
      </UBadge>

      <UBadge v-if="queryCity" color="primary" variant="soft" :label="queryCity">
        <template #trailing>
          <UButton icon="i-lucide-x" size="xs" color="primary" variant="ghost" class="-mr-1" aria-label="Şehir filtresini temizle" @click="updateFilters({ city: undefined })" />
        </template>
      </UBadge>

      <UBadge v-if="queryCategory" color="primary" variant="soft" :label="queryCategory">
        <template #trailing>
          <UButton icon="i-lucide-x" size="xs" color="primary" variant="ghost" class="-mr-1" aria-label="Kategori filtresini temizle" @click="updateFilters({ category: undefined })" />
        </template>
      </UBadge>

      <UBadge
        v-if="queryStartDate || queryEndDate"
        color="primary"
        variant="soft"
        :label="queryStartDate && queryEndDate
          ? `${formatDate(queryStartDate)} — ${formatDate(queryEndDate)}`
          : queryStartDate ? `${formatDate(queryStartDate)} →` : `→ ${formatDate(queryEndDate)}`"
      >
        <template #trailing>
          <UButton
            icon="i-lucide-x" size="xs" color="primary" variant="ghost" class="-mr-1"
            aria-label="Tarih filtresini temizle"
            @click="() => { onClearStartDate(); onClearEndDate() }"
          />
        </template>
      </UBadge>

      <UButton
        size="xs" color="neutral" variant="ghost" label="Tümünü Temizle" icon="i-lucide-filter-x"
        @click="clearAllFilters"
      />
    </div>

    <EventList
      v-if="loading || error"
      :events="events"
      :loading="loading"
      :error="error"
      :skeleton-count="12"
      @retry="fetchEvents"
    />

    <div v-else-if="events.length === 0">
      <UEmpty
        :icon="hasActiveFilters ? 'i-lucide-search-x' : 'i-lucide-calendar-x'"
        :title="hasActiveFilters ? 'Aramanıza uygun etkinlik bulunamadı' : 'Şu an gösterilecek etkinlik yok'"
        :description="hasActiveFilters ? 'Farklı filtreler deneyebilir veya tüm filtreleri temizleyebilirsiniz.' : 'Lütfen daha sonra tekrar deneyin.'"
      >
        <template v-if="hasActiveFilters" #actions>
          <UButton label="Filtreleri Temizle" color="primary" variant="soft" icon="i-lucide-filter-x" @click="clearAllFilters" />
        </template>
      </UEmpty>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <EventCard v-for="event in events" :key="event.id" :event="event" />
    </div>

    <div
      v-if="!loading && !error && pageInfo && pageInfo.totalPages > 1"
      class="flex items-center justify-center gap-4 pt-4"
    >
      <UButton icon="i-lucide-chevron-left" :disabled="queryPage <= 1" color="neutral" variant="soft" aria-label="Önceki sayfa" @click="updatePage(queryPage - 1)" />
      <span class="text-sm text-gray-600 dark:text-gray-300 font-medium">
        {{ queryPage }} / {{ pageInfo.totalPages }}
      </span>
      <UButton icon="i-lucide-chevron-right" :disabled="queryPage >= pageInfo.totalPages" color="neutral" variant="soft" aria-label="Sonraki sayfa" @click="updatePage(queryPage + 1)" />
    </div>
  </UContainer>
</template>
