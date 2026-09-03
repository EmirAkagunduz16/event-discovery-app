import { describe, expect, it } from 'vitest'
import { eventFilterSchema, searchSchema } from '~/schemas/filters'

describe('zod validasyon şemaları', () => {
  describe('eventFilterSchema (Tarih filtreleme kuralları)', () => {
    it('senaryo 1: endDate startDate değerinden önceyse şema hata fırlatmalı', () => {
      const invalidData = {
        startDate: '2026-10-15',
        endDate: '2026-10-01',
      }

      // parse() doğrudan hata fırlatır
      expect(() => eventFilterSchema.parse(invalidData)).toThrow()

      // safeParse ile hata detayını ve mesajını doğrula
      const result = eventFilterSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain('endDate')
        expect(result.error.issues[0]?.message).toBe('Bitiş tarihi başlangıç tarihinden önce olamaz')
      }
    })

    it('senaryo 2: endDate startDate değerinden sonraysa şema geçerli kabul etmeli', () => {
      const validData = {
        startDate: '2026-10-01',
        endDate: '2026-10-15',
      }

      const result = eventFilterSchema.safeParse(validData)
      expect(result.success).toBe(true)
      expect(eventFilterSchema.parse(validData)).toEqual(expect.objectContaining(validData))
    })

    it('senaryo 3: sadece startDate dolu endDate boşsa şema geçerli kabul etmeli', () => {
      const singleStartDate = {
        startDate: '2026-10-01',
        endDate: '',
      }

      const result = eventFilterSchema.safeParse(singleStartDate)
      expect(result.success).toBe(true)
    })

    it('ek kontrol: sadece endDate dolu startDate boşsa şema geçerli kabul etmeli', () => {
      const singleEndDate = {
        startDate: '',
        endDate: '2026-10-31',
      }

      const result = eventFilterSchema.safeParse(singleEndDate)
      expect(result.success).toBe(true)
    })

    it('ek kontrol: startDate ve endDate aynı gün ise geçerli kabul etmeli', () => {
      const sameDay = {
        startDate: '2026-10-01',
        endDate: '2026-10-01',
      }

      const result = eventFilterSchema.safeParse(sameDay)
      expect(result.success).toBe(true)
    })
  })

  describe('searchSchema (Arama kelimesi kuralları)', () => {
    it('sadece boşluklardan oluşan giriş reddedilmeli', () => {
      const result = searchSchema.safeParse({ keyword: '   ' })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('Arama ifadesi yalnızca boşluklardan oluşamaz')
      }
    })

    it('1 karakterlik giriş reddedilmeli (min 2 karakter)', () => {
      const result = searchSchema.safeParse({ keyword: 'a' })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('Aramak için en az 2 karakter girin')
      }
    })

    it('boş string arama sıfırlama olarak geçerli kabul edilmeli', () => {
      const result = searchSchema.safeParse({ keyword: '' })
      expect(result.success).toBe(true)
    })

    it('2 veya daha fazla karakterli arama geçerli kabul edilmeli', () => {
      const result = searchSchema.safeParse({ keyword: 'rock' })
      expect(result.success).toBe(true)
    })
  })
})
