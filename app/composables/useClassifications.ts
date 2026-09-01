// useClassifications — fetch event segments for the category filter

const DEFAULT_SEGMENTS = [
  { id: 'KZFzniwnSyZfZ7v7nJ', name: 'Music' },
  { id: 'KZFzniwnSyZfZ7v7nE', name: 'Sports' },
  { id: 'KZFzniwnSyZfZ7v7na', name: 'Arts & Theatre' },
  { id: 'KZFzniwnSyZfZ7v7nn', name: 'Film' },
  { id: 'KZFzniwnSyZfZ7v7n1', name: 'Miscellaneous' },
]

export function useClassifications() {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const classifications = ref<Array<{ id: string, name: string }>>([...DEFAULT_SEGMENTS])

  async function getClassifications() {
    loading.value = true
    error.value = null

    try {
      const data = await $fetch<any>('/api/classifications')
      const raw = data._embedded?.classifications ?? []
      const segmentsMap = new Map<string, { id: string, name: string }>()

      for (const item of raw) {
        if (item.segment?.id && item.segment?.name && item.segment.name !== 'Undefined') {
          segmentsMap.set(item.segment.id, { id: item.segment.id, name: item.segment.name })
        }
      }

      if (segmentsMap.size > 0) {
        classifications.value = Array.from(segmentsMap.values())
      }
    }
    catch (err: unknown) {
      error.value = (err as { statusMessage?: string })?.statusMessage ?? 'Kategoriler yüklenemedi.'
    }
    finally {
      loading.value = false
    }
  }

  return { loading, error, classifications, getClassifications }
}
