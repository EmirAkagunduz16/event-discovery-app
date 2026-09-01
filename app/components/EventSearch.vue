<script lang="ts" setup>
const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'search', keyword: string): void
  (e: 'clear'): void
}>()

const inputValue = ref(props.modelValue)
const showHint = computed(() => inputValue.value.length === 1)
let debounceTimer: number | null = null

watch(
  () => props.modelValue,
  (val) => { inputValue.value = val },
)

function onInput(val: string) {
  inputValue.value = val
  emit('update:modelValue', val)

  if (debounceTimer)
    clearTimeout(debounceTimer)

  if (val.length === 0) {
    debounceTimer = setTimeout(emit, 400, 'search', '')
    return
  }

  if (val.length < 2)
    return

  debounceTimer = setTimeout(emit, 400, 'search', val)
}

function onClear() {
  inputValue.value = ''
  emit('update:modelValue', '')
  emit('clear')
}
</script>

<template>
  <div class="flex flex-col gap-1">
    <UInput
      :model-value="inputValue"
      placeholder="Etkinlik, sanatçı veya mekan ara..."
      size="lg"
      leading-icon="i-lucide-search"
      :trailing-icon="inputValue ? 'i-lucide-x' : undefined"
      :ui="{ trailingIcon: 'cursor-pointer' }"
      @update:model-value="onInput"
      @click:trailing="onClear"
    />
    <p v-if="showHint" class="text-xs text-gray-400 dark:text-gray-500 pl-1">
      Aramak için en az 2 karakter girin
    </p>
  </div>
</template>
