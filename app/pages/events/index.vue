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

// ─── API çağrısı ───────────────────────────────────────────────────────────
function fetchEvents() {
  const keyword = queryKeyword.value || undefined
  const city = queryCity.value || undefined
  const classificationName = queryCategory.value || undefined
  const startDate = queryStartDate.value || undefined
  const endDate = queryEndDate.value || undefined

  getEvents({
    keyword,
    city,
    classificationName,
    startDateTime: startDate ? `${startDate}T00:00:00Z` : undefined,
    endDateTime: endDate ? `${endDate}T23:59:59Z` : undefined,
    sort: querySort.value,
    page: queryPage.value - 1,
    size: 12,
  })
}

watch(
  () => route.query,
  () => fetchEvents(),
  { immediate: true },
)

function updateFilters(patch: Record<string, string | number | undefined>) {
  router.push({
    query: {
      ...route.query,
      ...patch,
      page: 1,
    },
  })
}

function updatePage(newPage: number) {
  router.push({
    query: {
      ...route.query,
      page: newPage,
    },
  })
}
</script>

<template>
  <UContainer class="py-8 space-y-8">
    <!-- ── Sayfa Başlığı ───────────────────────────────────────────────── -->
    <div class="space-y-1">
      <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight">
        Tüm Etkinlikler
      </h1>
      <p
        v-if="!loading && pageInfo"
        class="text-sm text-gray-500 dark:text-gray-400"
      >
        Toplam
        <span class="font-semibold text-gray-700 dark:text-gray-200">
          {{ pageInfo.totalElements.toLocaleString('tr-TR') }}
        </span>
        etkinlik bulundu
      </p>
    </div>

    <!-- ── Arama / Filtre Alanı (sonraki branch'lerde doldurulacak) ───── -->
    <!-- EventSearch ve EventFilters component'leri buraya eklenecek -->

    <!-- Aktif filtreler varsa rozet olarak göster -->
    <div
      v-if="queryKeyword || queryCity || queryCategory || queryStartDate || queryEndDate"
      class="flex flex-wrap gap-2"
    >
      <UBadge
        v-if="queryKeyword"
        color="primary"
        variant="soft"
        :label="`Arama: ${queryKeyword}`"
      >
        <template #trailing>
          <UButton
            icon="i-lucide-x"
            size="xs"
            color="primary"
            variant="ghost"
            class="-mr-1"
            aria-label="Aramayı temizle"
            @click="updateFilters({ keyword: undefined })"
          />
        </template>
      </UBadge>

      <UBadge
        v-if="queryCity"
        color="primary"
        variant="soft"
        :label="`Şehir: ${queryCity}`"
      >
        <template #trailing>
          <UButton
            icon="i-lucide-x"
            size="xs"
            color="primary"
            variant="ghost"
            class="-mr-1"
            aria-label="Şehir filtresini temizle"
            @click="updateFilters({ city: undefined })"
          />
        </template>
      </UBadge>

      <UBadge
        v-if="queryCategory"
        color="primary"
        variant="soft"
        :label="`Kategori: ${queryCategory}`"
      >
        <template #trailing>
          <UButton
            icon="i-lucide-x"
            size="xs"
            color="primary"
            variant="ghost"
            class="-mr-1"
            aria-label="Kategori filtresini temizle"
            @click="updateFilters({ category: undefined })"
          />
        </template>
      </UBadge>

      <UButton
        size="xs"
        color="neutral"
        variant="ghost"
        label="Tümünü Temizle"
        icon="i-lucide-filter-x"
        @click="router.push({ query: { sort: querySort } })"
      />
    </div>

    <EventList
      :events="events"
      :loading="loading"
      :error="error"
      :skeleton-count="12"
      @retry="fetchEvents"
    />

    <!-- ── Pagination (sonraki branch'te gerçek UPagination gelecek) ─── -->
    <div
      v-if="!loading && !error && pageInfo && pageInfo.totalPages > 1"
      class="flex items-center justify-center gap-4 pt-4"
    >
      <UButton
        icon="i-lucide-chevron-left"
        :disabled="queryPage <= 1"
        color="neutral"
        variant="soft"
        aria-label="Önceki sayfa"
        @click="updatePage(queryPage - 1)"
      />

      <span class="text-sm text-gray-600 dark:text-gray-300 font-medium">
        {{ queryPage }} / {{ pageInfo.totalPages }}
      </span>

      <UButton
        icon="i-lucide-chevron-right"
        :disabled="queryPage >= pageInfo.totalPages"
        color="neutral"
        variant="soft"
        aria-label="Sonraki sayfa"
        @click="updatePage(queryPage + 1)"
      />
    </div>
  </UContainer>
</template>
