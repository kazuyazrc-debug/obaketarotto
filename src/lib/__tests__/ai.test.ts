import { describe, expect, it } from 'vitest'
import { mergeEnhancedReading } from '../ai'
import type { ReadingResult } from '../reading'

function createReadingFixture(): ReadingResult {
  return {
    id: 'reading-1',
    createdAt: '2026-04-16T00:00:00.000Z',
    input: {
      nickname: 'テスト',
      intent: '仕事',
      question: '企画の進め方を知りたい',
      timeframe: '今週',
      spreadId: 'sixfold',
      reversals: false,
      relationTheme: false,
      relationType: '',
      background: '新しい企画を進めている',
    },
    spread: {
      id: 'sixfold',
      name: '六芒星スプレッド',
      description: '6枚で読む',
      cardCount: 6,
      positions: [
        { index: 0, label: '過去', weight: 0.72, prompt: 'これまでの流れ' },
        { index: 1, label: '現在', weight: 1, prompt: 'いまの中心' },
        { index: 2, label: '未来', weight: 0.88, prompt: 'この先' },
        { index: 3, label: '手段', weight: 0.82, prompt: '進め方' },
        { index: 4, label: 'マインドセット', weight: 0.8, prompt: '心の持ち方' },
        { index: 5, label: '全体運勢', weight: 0.92, prompt: '総合の傾向' },
      ],
    },
    keyCardNo: 1,
    keyCardReason: '現在のカードが核です。',
    pairFocus: [],
    anchorCardNo: 1,
    summary: {
      short: '短い要約',
      medium: '中くらいの要約',
      long: '長い要約',
    },
    totalComment: '元の総合コメント',
    positions: [
      {
        label: '過去',
        prompt: 'これまでの流れ',
        cardNo: 12,
        cardName: '吊るされた男',
        personLabel: 'よもすえぞう',
        roleLabel: '反転',
        motif: '見方の転換',
        reversed: false,
        short: '過去 short',
        medium: '過去 medium',
        long: '過去 long',
      },
      {
        label: '現在',
        prompt: 'いまの中心',
        cardNo: 1,
        cardName: '魔術師',
        personLabel: 'nica',
        roleLabel: '創造',
        motif: '試作',
        reversed: false,
        short: '現在 short',
        medium: '現在 medium',
        long: '現在 long',
      },
    ],
    disclaimer: 'これは内省のための読みです。',
  }
}

describe('mergeEnhancedReading', () => {
  it('AI出力の summary / totalComment / positions を上書きする', () => {
    const reading = createReadingFixture()

    const merged = mergeEnhancedReading(reading, {
      reading: {
        summary: {
          short: '新しい短文',
          medium: '新しい中文',
          long: '新しい長文',
        },
        totalComment: '新しい総合コメント',
        positions: [
          { short: 'AI過去 short', medium: 'AI過去 medium', long: 'AI過去 long' },
          { short: 'AI現在 short', medium: 'AI現在 medium', long: 'AI現在 long' },
        ],
      },
    })

    expect(merged.summary.short).toBe('新しい短文')
    expect(merged.totalComment).toBe('新しい総合コメント')
    expect(merged.positions[0].medium).toBe('AI過去 medium')
    expect(merged.positions[1].long).toBe('AI現在 long')
    expect(merged.positions[1].cardName).toBe('魔術師')
  })
})
