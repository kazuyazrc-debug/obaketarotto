import { describe, expect, it } from 'vitest'
import { sanitizeReadingText } from '../readingDisplay'

describe('sanitizeReadingText', () => {
  it('normalizes judgment card mislabeling to 審判', () => {
    expect(sanitizeReadingText('裁判が中心に座り、流れを結び直します。')).toContain('審判')
    expect(sanitizeReadingText('裁判が中心に座り、流れを結び直します。')).not.toContain('裁判')
  })
})
