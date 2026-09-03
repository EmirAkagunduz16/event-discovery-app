<script lang="ts" setup>
import type { TmEventSortOption } from '~~/types/event'
import { formatCategory } from '~/utils/formatters'

useHead({ title: 'Etkinlikler | Event Discovery' })

const route = useRoute()
const router = useRouter()

const { loading, error, data, getEvents } = useEvents()

const events = computed(() => data.value?._embedded?.events ?? [])
const pageInfo = computed(() => data.value?.page ?? null)

const PAGE_SIZE = 12

const isFilterDrawerOpen = ref(false)

const q = computed(() => ({
  keyword: (route.query.keyword as string) ?? '',
  category: (route.query.category as string) ?? '',
  startDate: (route.query.startDate as string) ?? '',
  endDate: (route.query.endDate as string) ?? '',
  sort: ((route.query.sort as TmEventSortOption) ?? 'date,asc'),
  page: Math.max(1, Number(route.query.page) || 1),
}))

const activeFiltersCount = computed(() => {
  let count = 0
  if (q.value.category)
    count++
  if (q.value.startDate || q.value.endDate)
    count++
  return count
})

const totalPages = computed(() => {
  if (!pageInfo.value?.totalPages)
    return 0
  // Ticketmaster API en fazla 1000 sonuca kadar sayfalamaya izin verir (page * size < 1000)
  const maxTmPages = Math.floor(1000 / PAGE_SIZE)
  return Math.min(pageInfo.value.totalPages, maxTmPages)
})

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

function fetchEvents() {
  getEvents({
    keyword: q.value.keyword || undefined,
    classificationName: q.value.category || undefined,
    localStartDateTime: q.value.startDate ? `${q.value.startDate}T00:00:00` : undefined,
    localEndDateTime: q.value.endDate ? `${q.value.endDate}T23:59:59` : undefined,
    sort: q.value.sort,
    page: q.value.page - 1,
    size: PAGE_SIZE,
  })
}

watch(() => route.query, fetchEvents, { immediate: true })

watch(
  () => route.query.page,
  (newPage, oldPage) => {
    if (newPage !== oldPage && import.meta.client) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  },
)

function updateFilters(patch: Record<string, string | number | undefined>) {
  router.push({ query: { ...route.query, ...patch, page: 1 } })
}

function updatePage(n: number) {
  router.push({ query: { ...route.query, page: n } })
  if (import.meta.client) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

function clearAllFilters() {
  router.push({ query: { sort: q.value.sort, page: 1 } })
}
</script>

<template>
  <UContainer class="py-8 space-y-6">
    <!-- Üst Başlık & Geri Dön -->
    <div class="space-y-4">
      <UButton
        to="/"
        icon="i-lucide-arrow-left"
        label="Ana Sayfaya Dön"
        variant="ghost"
        color="neutral"
        size="sm"
        class="-ml-2 min-h-[44px] px-3"
      />
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
    </div>

    <!-- Arama Çubuğu (Her boyutta tam genişlikte) -->
    <EventSearch
      :model-value="q.keyword"
      @search="kw => updateFilters({ keyword: kw || undefined })"
    />

    <!-- Mobil / Tablet Filtre & Sıralama Çubuğu (< lg) -->
    <div class="flex items-center justify-between gap-3 lg:hidden">
      <UButton
        icon="i-lucide-filter"
        label="Filtrele"
        color="neutral"
        variant="outline"
        size="md"
        class="min-h-[44px] px-4 font-medium"
        @click="isFilterDrawerOpen = true"
      >
        <template #trailing>
          <UBadge
            v-if="activeFiltersCount > 0"
            :label="String(activeFiltersCount)"
            size="xs"
            color="primary"
            variant="solid"
            class="rounded-full"
          />
        </template>
      </UButton>

      <EventSort
        :model-value="q.sort"
        @update:model-value="val => updateFilters({ sort: val })"
      />
    </div>

    <!-- Mobil Filtre Çekmecesi (USlideover) -->
    <USlideover
      v-model:open="isFilterDrawerOpen"
      side="right"
      title="Filtreler"
      description="Etkinlikleri kriterlere göre filtreleyin"
    >
      <template #body>
        <div class="p-4 space-y-6">
          <EventFilters
            :category="q.category"
            :start-date="q.startDate"
            :end-date="q.endDate"
            @update:category="updateFilters({ category: $event || undefined })"
            @update:start-date="updateFilters({ startDate: $event || undefined })"
            @update:end-date="updateFilters({ endDate: $event || undefined })"
          />

          <div class="pt-4 border-t border-gray-100 dark:border-gray-800">
            <EventSort
              :model-value="q.sort"
              block
              @update:model-value="val => updateFilters({ sort: val })"
            />
          </div>
        </div>
      </template>

      <template #footer>
        <div class="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3 w-full">
          <UButton
            v-if="hasActiveFilters"
            label="Temizle"
            color="neutral"
            variant="ghost"
            class="min-h-[44px]"
            @click="clearAllFilters"
          />
          <UButton
            label="Uygula ve Kapat"
            color="primary"
            variant="solid"
            class="ml-auto min-h-[44px] px-5"
            @click="isFilterDrawerOpen = false"
          />
        </div>
      </template>
    </USlideover>

    <!-- Ana İçerik: Masaüstü Sol Filtre + Sağ Sonuçlar (lg:flex) -->
    <div class="lg:flex lg:gap-8 items-start">
      <!-- Masaüstü Sol Sabit Filtre Sütunu (>= lg) -->
      <aside class="hidden lg:block lg:w-72 shrink-0 sticky top-20">
        <UCard class="space-y-5">
          <div class="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
            <h3 class="font-bold text-base flex items-center gap-2">
              <UIcon name="i-lucide-filter" class="w-4 h-4 text-primary-500" />
              <span>Filtreler</span>
            </h3>
            <UButton
              v-if="hasActiveFilters"
              size="xs"
              color="neutral"
              variant="ghost"
              label="Temizle"
              class="min-h-[32px]"
              @click="clearAllFilters"
            />
          </div>

          <div class="space-y-4">
            <EventFilters
              :category="q.category"
              :start-date="q.startDate"
              :end-date="q.endDate"
              @update:category="updateFilters({ category: $event || undefined })"
              @update:start-date="updateFilters({ startDate: $event || undefined })"
              @update:end-date="updateFilters({ endDate: $event || undefined })"
            />

            <div class="pt-3 border-t border-gray-100 dark:border-gray-800">
              <EventSort
                :model-value="q.sort"
                block
                @update:model-value="val => updateFilters({ sort: val })"
              />
            </div>
          </div>
        </UCard>
      </aside>

      <!-- Sağ Bölüm: Aktif Chip'ler + Sonuçlar + Pagination -->
      <main class="flex-1 min-w-0 space-y-6">
        <!-- Aktif Filtre Chip'leri (Wrap olan satırlar) -->
        <div v-if="hasActiveFilters" class="flex flex-wrap gap-2 items-center">
          <UBadge v-if="q.keyword" color="primary" variant="soft" :label="`Arama: ${q.keyword}`">
            <template #trailing>
              <UButton
                icon="i-lucide-x"
                size="xs"
                color="primary"
                variant="ghost"
                class="-mr-1 min-w-[32px] min-h-[32px] p-1 flex items-center justify-center"
                aria-label="Arama filtresini kaldır"
                @click="updateFilters({ keyword: undefined })"
              />
            </template>
          </UBadge>

          <UBadge v-if="q.category" color="primary" variant="soft" :label="formatCategory(q.category) ?? q.category">
            <template #trailing>
              <UButton
                icon="i-lucide-x"
                size="xs"
                color="primary"
                variant="ghost"
                class="-mr-1 min-w-[32px] min-h-[32px] p-1 flex items-center justify-center"
                aria-label="Kategori filtresini kaldır"
                @click="updateFilters({ category: undefined })"
              />
            </template>
          </UBadge>

          <UBadge v-if="q.startDate || q.endDate" color="primary" variant="soft" :label="dateChipLabel">
            <template #trailing>
              <UButton
                icon="i-lucide-x"
                size="xs"
                color="primary"
                variant="ghost"
                class="-mr-1 min-w-[32px] min-h-[32px] p-1 flex items-center justify-center"
                aria-label="Tarih filtresini kaldır"
                @click="updateFilters({ startDate: undefined, endDate: undefined })"
              />
            </template>
          </UBadge>

          <UButton
            size="xs"
            color="neutral"
            variant="ghost"
            label="Tümünü Temizle"
            icon="i-lucide-filter-x"
            class="min-h-[36px] px-2.5"
            @click="clearAllFilters"
          />
        </div>

        <!-- Etkinlik Listesi -->
        <EventList
          v-if="loading || error || events.length > 0"
          :events="events"
          :loading="loading"
          :error="error"
          :skeleton-count="PAGE_SIZE"
          @retry="fetchEvents"
        />

        <!-- Boş Durum -->
        <UEmpty
          v-else
          icon="i-lucide-search-x"
          :title="q.page > 1 ? 'Bu sayfada gösterilecek etkinlik bulunamadı' : (hasActiveFilters ? 'Aramanıza uygun etkinlik bulunamadı' : 'Şu an gösterilecek etkinlik yok')"
          :description="q.page > 1 ? 'Sayfa numarası mevcut etkinlik sınırının dışında olabilir. İlk sayfaya dönebilirsiniz.' : (hasActiveFilters ? 'Farklı filtreler deneyebilir veya tüm filtreleri temizleyebilirsiniz.' : 'Lütfen daha sonra tekrar deneyin.')"
        >
          <template #actions>
            <UButton
              v-if="q.page > 1"
              label="İlk Sayfaya Dön"
              color="primary"
              variant="solid"
              icon="i-lucide-arrow-left"
              class="min-h-[44px]"
              @click="updatePage(1)"
            />
            <UButton
              v-else-if="hasActiveFilters"
              label="Filtreleri Temizle"
              color="primary"
              variant="soft"
              icon="i-lucide-filter-x"
              class="min-h-[44px]"
              @click="clearAllFilters"
            />
          </template>
        </UEmpty>

        <!-- Pagination -->
        <div
          v-if="!loading && !error && totalPages > 1"
          class="flex justify-center pt-6 pb-2"
        >
          <UPagination
            :page="q.page"
            :total="totalPages * PAGE_SIZE"
            :items-per-page="PAGE_SIZE"
            :show-edges="true"
            :sibling-count="1"
            size="md"
            @update:page="updatePage"
          />
        </div>
      </main>
    </div>
  </UContainer>
</template>
