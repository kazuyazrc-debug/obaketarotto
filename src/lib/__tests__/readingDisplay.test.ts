import { describe, expect, it } from 'vitest'
import { sanitizeCharacterReferences, sanitizeReadingText } from '../readingDisplay'
import type { ReadingResult } from '../reading'

describe('sanitizeCharacterReferences', () => {
  it('フルネームだけでなく短縮名も除去する', () => {
    const text = '曖昧なままでは進まない。メウの皇帝は、覚悟を見せて基準を置くことで全体を走らせる。'

    const sanitized = sanitizeCharacterReferences(text, ['大神メウ'])

    expect(sanitized).not.toContain('メウ')
    expect(sanitized).not.toContain('大神メウ')
    expect(sanitized).toContain('皇帝')
  })
})

describe('sanitizeReadingText', () => {
  it('読解本文からカード人物名を取り除く', () => {
    const reading = {
      input: {
        nickname: 'テスト',
      },
      positions: [
        { personLabel: '大神メウ' },
      ],
    } as ReadingResult

    const sanitized = sanitizeReadingText(
      'テストさんへ。メウの皇帝は、覚悟を見せて基準を置くことで全体を走らせる。',
      reading,
    )

    expect(sanitized).toContain('テストさん')
    expect(sanitized).not.toContain('メウ')
    expect(sanitized).not.toContain('大神メウ')
  })
})
