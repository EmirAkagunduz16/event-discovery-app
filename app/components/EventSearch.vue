<script lang="ts" setup>
const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ search: [keyword: string] }>()

const input = ref(props.modelValue)
const showHint = computed(() => input.value.length === 1)
let timer: ReturnType<typeof setTimeout>

watch(() => props.modelValue, val => (input.value = val))

function onInput(val: string) {
  input.value = val
  clearTimeout(timer)
  if (val.length === 1)
    return
  timer = setTimeout(() => emit('search', val.trim()), 400)
}

function onClear() {
  input.value = ''
  emit('search', '')
}
</script>

<template>
  <div class="flex flex-col gap-1">
    <UInput
      :model-value="input"
      placeholder="Etkinlik, sanatçı veya mekan ara..."
      size="lg"
      leading-icon="i-lucide-search"
      :trailing-icon="input ? 'i-lucide-x' : undefined"
      @update:model-value="onInput"
      @click:trailing="onClear"
    />
    <p v-if="showHint" class="text-xs text-gray-400 dark:text-gray-500 pl-1">
      Aramak için en az 2 karakter girin
    </p>
  </div>
</template>
