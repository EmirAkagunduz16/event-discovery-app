import { z } from 'zod'

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

export function isValidDateString(val: string): boolean {
  if (!DATE_REGEX.test(val))
    return false
  const [year, month, day] = val.split('-').map(Number)
  if (!year || !month || !day)
    return false
  const date = new Date(year, month - 1, day)
  return (
    date.getFullYear() === year
    && date.getMonth() === month - 1
    && date.getDate() === day
  )
}

export const dateFieldSchema = z.string()
  .refine(val => !val || isValidDateString(val), {
    message: 'Geçerli bir tarih formatı giriniz (YYYY-AA-GG)',
  })
  .optional()
  .or(z.literal(''))

export const keywordFieldSchema = z.string()
  .superRefine((val, ctx) => {
    if (!val || val === '')
      return

    const trimmed = val.trim()
    if (trimmed.length === 0) {
      ctx.addIssue({
        code: 'custom',
        message: 'Arama ifadesi yalnızca boşluklardan oluşamaz',
      })
      return
    }

    if (trimmed.length < 2) {
      ctx.addIssue({
        code: 'custom',
        message: 'Aramak için en az 2 karakter girin',
      })
    }
  })
  .optional()
  .or(z.literal(''))

export const searchSchema = z.object({
  keyword: keywordFieldSchema,
})

export type SearchFormState = z.infer<typeof searchSchema>

export const eventFilterSchema = z.object({
  category: z.string().optional().or(z.literal('')),
  city: z.string().trim().max(100, 'Şehir adı en fazla 100 karakter olabilir').optional().or(z.literal('')),
  startDate: dateFieldSchema,
  endDate: dateFieldSchema,
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return data.endDate >= data.startDate
  }
  return true
}, {
  message: 'Bitiş tarihi başlangıç tarihinden önce olamaz',
  path: ['endDate'],
})

export type EventFilterFormState = z.infer<typeof eventFilterSchema>
