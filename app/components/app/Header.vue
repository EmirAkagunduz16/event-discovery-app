<script lang="ts" setup>
import { MoonIcon, SunIcon } from '@heroicons/vue/24/outline'
import { useFavoritesStore } from '~~/stores/favorites'

const route = useRoute()
const favoritesStore = useFavoritesStore()
const favCount = computed(() => favoritesStore.count)

const colorMode = useColorMode()
const isMenuOpen = ref(false)

// Menüdeki linke tıklandığında veya route değiştiğinde menüyü kapat
watch(() => route.path, () => {
  isMenuOpen.value = false
})

const isDark = computed({
  get() {
    return colorMode.value === 'dark'
  },
  set() {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
  },
})

function toggleColorMode() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>

<template>
  <header class="sticky top-0 z-50 backdrop-blur-md bg-white/85 dark:bg-gray-950/85 border-b border-gray-200 dark:border-gray-800 transition-colors">
    <UContainer class="flex items-center justify-between h-16">
      <!-- Logo / Ana Sayfa Linki -->
      <NuxtLink
        to="/"
        class="flex items-center gap-2.5 font-extrabold text-lg tracking-tight text-gray-900 dark:text-white hover:text-primary-500 transition-colors min-h-11"
      >
        <div class="w-8 h-8 rounded-lg bg-primary-500/10 dark:bg-primary-500/20 flex items-center justify-center text-primary-500">
          <UIcon name="tabler:brand-nuxt" class="w-5 h-5" />
        </div>
        <span>Event Discovery</span>
      </NuxtLink>

      <!-- Masaüstü Navigasyon Menüsü (>= md) -->
      <nav class="hidden md:flex items-center gap-1 sm:gap-3">
        <UButton
          to="/"
          label="Ana Sayfa"
          variant="ghost"
          color="neutral"
          size="sm"
          icon="i-lucide-home"
          class="min-h-11 px-3"
        />

        <UButton
          to="/events"
          label="Etkinlikler"
          variant="ghost"
          color="neutral"
          size="sm"
          icon="i-lucide-calendar"
          class="min-h-11 px-3"
        />

        <UButton
          to="/favorites"
          variant="ghost"
          color="neutral"
          size="sm"
          icon="i-lucide-heart"
          class="min-h-11 px-3"
        >
          <span>Favoriler</span>
          <UBadge
            v-if="favCount > 0"
            :label="String(favCount)"
            size="xs"
            color="primary"
            variant="solid"
            class="rounded-full"
          />
        </UButton>

        <!-- Tema Değiştirme Butonu (Masaüstü) -->
        <ClientOnly>
          <UButton
            square
            variant="ghost"
            color="neutral"
            size="sm"
            class="min-w-11 min-h-11 flex items-center justify-center"
            :aria-label="isDark ? 'Açık moda geç' : 'Koyu moda geç'"
            :title="isDark ? 'Açık moda geç' : 'Koyu moda geç'"
            @click="toggleColorMode"
          >
            <MoonIcon v-if="isDark" class="w-5 h-5" />
            <SunIcon v-else class="w-5 h-5" />
          </UButton>
          <template #fallback>
            <div class="w-11 h-11" />
          </template>
        </ClientOnly>
      </nav>

      <!-- Mobil Aksiyonlar (< md) -->
      <div class="flex items-center gap-1 md:hidden">
        <!-- Tema Değiştirme Butonu (Mobil) -->
        <ClientOnly>
          <UButton
            square
            variant="ghost"
            color="neutral"
            size="sm"
            class="min-w-11 min-h-11 flex items-center justify-center"
            :aria-label="isDark ? 'Açık moda geç' : 'Koyu moda geç'"
            :title="isDark ? 'Açık moda geç' : 'Koyu moda geç'"
            @click="toggleColorMode"
          >
            <MoonIcon v-if="isDark" class="w-5 h-5" />
            <SunIcon v-else class="w-5 h-5" />
          </UButton>
          <template #fallback>
            <div class="w-11 h-11" />
          </template>
        </ClientOnly>

        <!-- Hamburger Menü Butonu -->
        <UButton
          square
          variant="ghost"
          color="neutral"
          size="sm"
          icon="i-lucide-menu"
          class="min-w-11 min-h-11 flex items-center justify-center"
          aria-label="Menüyü Aç"
          @click="isMenuOpen = true"
        />
      </div>
    </UContainer>

    <!-- Mobil Yandan Kayan Panel (USlideover) -->
    <USlideover
      v-model:open="isMenuOpen"
      side="right"
      title="Event Discovery"
      description="Menü ve Navigasyon"
    >
      <template #body>
        <div class="flex flex-col gap-2 p-4">
          <UButton
            to="/"
            label="Ana Sayfa"
            variant="ghost"
            color="neutral"
            size="lg"
            icon="i-lucide-home"
            class="justify-start text-base py-3 min-h-11 w-full"
            @click="isMenuOpen = false"
          />

          <UButton
            to="/events"
            label="Etkinlikler"
            variant="ghost"
            color="neutral"
            size="lg"
            icon="i-lucide-calendar"
            class="justify-start text-base py-3 min-h-11 w-full"
            @click="isMenuOpen = false"
          />

          <UButton
            to="/favorites"
            variant="ghost"
            color="neutral"
            size="lg"
            icon="i-lucide-heart"
            class="justify-between text-base py-3 min-h-11 w-full"
            @click="isMenuOpen = false"
          >
            <span>Favoriler</span>
            <UBadge
              v-if="favCount > 0"
              :label="String(favCount)"
              size="sm"
              color="primary"
              variant="solid"
              class="rounded-full ml-auto"
            />
          </UButton>
        </div>
      </template>

      <template #footer>
        <div class="p-4 flex items-center justify-between gap-2">
          <span class="text-sm text-gray-500 dark:text-gray-400">Görünüm Teması</span>
          <ClientOnly>
            <UButton
              variant="outline"
              color="neutral"
              size="sm"
              class="min-h-11 px-3 flex items-center gap-2"
              @click="toggleColorMode"
            >
              <MoonIcon v-if="isDark" class="w-4 h-4" />
              <SunIcon v-else class="w-4 h-4" />
              <span>{{ isDark ? 'Karanlık Mod' : 'Aydınlık Mod' }}</span>
            </UButton>
          </ClientOnly>
        </div>
      </template>
    </USlideover>
  </header>
</template>
