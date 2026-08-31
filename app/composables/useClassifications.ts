// useClassifications — fetch event segments for the category filter

export function useClassifications() {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const classifications = ref<Array<{ id: string, name: string }>>([])

  async function getClassifications() {
    if (classifications.value.length > 0)
      return // already loaded, skip

    loading.value = true
    error.value = null

    try {
      const data = await $fetch<any>('/api/classifications')
      classifications.value = (data._embedded?.classifications ?? [])
        .map((c: any) => ({ id: c.segment.id, name: c.segment.name }))
        .filter((c: any) => c.name !== 'Undefined')
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
