// GET /api/classifications
// Fetch event segments/genres for the category filter dropdown

export default defineEventHandler(async () => {
  const url = buildTmUrl('/classifications.json', { size: 40, locale: '*' })
  return tmFetch(url)
})
