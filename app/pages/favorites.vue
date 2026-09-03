<script lang="ts" setup>
import { useFavoritesStore } from '~~/stores/favorites'
import { formatEventDate } from '~/utils/formatters'

useHead({ title: 'Favorilerim | Event Discovery' })

const favoritesStore = useFavoritesStore()
const favorites = computed(() => favoritesStore.events)

// Onay modalı state'i
const showClearConfirm = ref(false)

function confirmClearAll() {
  favoritesStore.clearAll()
  showClearConfirm.value = false
}
</script>

<template>
  <UContainer class="py-8 space-y-6">
    <!-- Başlık -->
    <div class="space-y-4">
      <UButton
        to="/"
        icon="i-lucide-arrow-left"
        label="Ana Sayfaya Dön"
        variant="ghost"
        color="neutral"
        size="sm"
        class="-ml-2 min-h-11 px-3"
      />
      <div class="flex items-center justify-between">
        <div class="space-y-1">
          <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Favorilerim
          </h1>
          <p v-if="favorites.length > 0" class="text-sm text-gray-500 dark:text-gray-400">
            <span class="font-semibold text-gray-700 dark:text-gray-200">
              {{ favorites.length }}
            </span>
            etkinlik favorilerinizde
          </p>
        </div>

        <!-- Tümünü Temizle -->
        <UButton
          v-if="favorites.length > 0"
          icon="i-lucide-trash-2"
          label="Tümünü Temizle"
          color="error"
          variant="soft"
          size="sm"
          class="min-h-11 px-3"
          @click="showClearConfirm = true"
        />
      </div>
    </div>

    <!-- Favoriler Grid -->
    <div
      v-if="favorites.length > 0"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      <div
        v-for="fav in favorites"
        :key="fav.id"
        class="group"
      >
        <NuxtLink :to="`/events/${fav.id}`" class="block h-full">
          <UCard
            :ui="{
              header: 'p-0 sm:p-0',
              body: 'p-4 sm:p-5 flex-1 flex flex-col justify-between',
            }"
            class="h-full overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:ring-1 hover:ring-primary-500/40"
          >
            <!-- Görsel -->
            <template #header>
              <div class="relative aspect-video w-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <img
                  v-if="fav.image"
                  :src="fav.image"
                  :alt="fav.name"
                  loading="lazy"
                  class="w-full h-full object-cover"
                >
                <div
                  v-else
                  class="w-full h-full flex items-center justify-center text-gray-400"
                >
                  <UIcon name="i-lucide-image" class="w-12 h-12" />
                </div>

                <!-- Kategori -->
                <div v-if="fav.segment" class="absolute top-3 left-3">
                  <UBadge
                    :label="fav.segment"
                    color="primary"
                    variant="solid"
                    size="md"
                    class="shadow-md backdrop-blur-md"
                  />
                </div>

                <!-- Favori Çıkar Butonu -->
                <UButton
                  class="absolute top-3 right-3 rounded-full shadow-md backdrop-blur-sm min-w-11 min-h-11 flex items-center justify-center p-2.5"
                  color="error"
                  variant="solid"
                  icon="i-lucide-heart"
                  size="sm"
                  aria-label="Favorilerden Çıkar"
                  @click.stop.prevent="favoritesStore.toggle(fav)"
                />
              </div>
            </template>

            <!-- İçerik -->
            <div class="space-y-3 flex-1 flex flex-col justify-between">
              <div class="space-y-2">
                <h3 class="font-bold text-base leading-snug line-clamp-2 group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors">
                  {{ fav.name }}
                </h3>

                <div v-if="formatEventDate(fav.date, fav.time)" class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 font-medium">
                  <UIcon name="i-lucide-calendar" class="w-4 h-4 shrink-0 text-primary-500" />
                  <span>{{ formatEventDate(fav.date, fav.time) }}</span>
                </div>
              </div>

              <div class="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-1 text-xs text-gray-500 dark:text-gray-400">
                <div v-if="fav.city" class="flex items-center gap-1.5">
                  <UIcon name="i-lucide-map-pin" class="w-3.5 h-3.5 shrink-0 text-gray-400" />
                  <span class="truncate">{{ fav.city }}</span>
                </div>
                <div v-if="fav.venueName" class="flex items-center gap-1.5">
                  <UIcon name="i-lucide-building-2" class="w-3.5 h-3.5 shrink-0 text-gray-400" />
                  <span class="truncate">{{ fav.venueName }}</span>
                </div>
              </div>
            </div>
          </UCard>
        </NuxtLink>
      </div>
    </div>

    <!-- Boş State -->
    <UEmpty
      v-else
      icon="i-lucide-heart"
      title="Henüz favori eklemediniz"
      description="Beğendiğiniz etkinlikleri favorilere ekleyerek buradan kolayca erişebilirsiniz."
    >
      <template #actions>
        <UButton
          to="/events"
          label="Etkinlikleri Keşfet"
          color="primary"
          variant="solid"
          icon="i-lucide-compass"
        />
      </template>
    </UEmpty>

    <!-- Tümünü Temizle Onay Modalı -->
    <UModal v-model:open="showClearConfirm">
      <template #content>
        <UCard>
          <div class="space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center shrink-0">
                <UIcon name="i-lucide-trash-2" class="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 class="font-semibold text-lg">
                  Tüm favorileri temizle
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ favorites.length }} etkinlik favorilerinizden kalıcı olarak kaldırılacak. Bu işlem geri alınamaz.
                </p>
              </div>
            </div>
            <div class="flex justify-end gap-2">
              <UButton
                label="Vazgeç"
                color="neutral"
                variant="outline"
                @click="showClearConfirm = false"
              />
              <UButton
                label="Tümünü Temizle"
                color="error"
                variant="solid"
                icon="i-lucide-trash-2"
                @click="confirmClearAll"
              />
            </div>
          </div>
        </UCard>
      </template>
    </UModal>
  </UContainer>
</template>
