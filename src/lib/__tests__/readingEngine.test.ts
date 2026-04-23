import { describe, expect, it } from 'vitest'
import {
  geoSummaryClosingVariants,
  geoSummaryIntroVariants,
  narrateSummary,
} from '../narrator'
import {
  buildReadingSnapshot,
  createReading,
  type ReadingResult,
} from '../reading'

function createReadingFixture(): ReadingResult {
  const reading = createReading(
    {
      nickname: 'テスト',
      readingMode: 'deep',
      narratorMode: 'classic',
      intent: '恋愛',
      question: '相手との距離感をどう整えるべき？',
      timeframe: '今週',
      spreadId: 'sixfold',
      reversals: false,
      relationTheme: true,
      relationType: '気になる相手',
      background: '最近のやり取りがあり、空気が読みにくい。',
    },
    {
      anchorCardNo: 18,
      history: [],
    },
  )

  return {
    ...reading,
    id: 'reading-fixture',
    createdAt: '2026-04-20T00:00:00.000Z',
  }
}

function tailSentence(text: string) {
  const sentences = text.match(/[^。！？.!?]+[。！？.!?]?/g)
  return (sentences?.[sentences.length - 1] ?? text).replace(/\s+/g, '').trim()
}

describe('buildReadingSnapshot', () => {
  it('builds headline, focus, next step, caution, and history line', () => {
    const snapshot = buildReadingSnapshot(createReadingFixture())

    expect(snapshot.headline.length).toBeGreaterThan(0)
    expect(snapshot.focus.length).toBeGreaterThan(0)
    expect(snapshot.nextStep.length).toBeGreaterThan(0)
    expect(snapshot.caution.length).toBeGreaterThan(0)
    expect(snapshot.historyLine).toContain('恋愛')
  })

  it('keeps the anchor card inside the generated spread', () => {
    const reading = createReading(
      {
        nickname: 'テスト',
        readingMode: 'quick',
        narratorMode: 'classic',
        intent: '仕事',
        question: '今週の仕事で何を優先するべき？',
        timeframe: '今週',
        spreadId: 'sixfold',
        reversals: false,
        relationTheme: false,
        relationType: '',
        background: '',
      },
      {
        anchorCardNo: 1,
        history: [],
      },
    )

    expect(reading.anchorCardNo).toBe(1)
    expect(reading.positions.some((position) => position.cardNo === 1)).toBe(true)
    expect(reading.generatedHistorySnapshots.length).toBe(reading.positions.length)
  })

  it('uses the anchor card as the key card when anchorCardNo is provided', () => {
    const reading = createReading(
      {
        nickname: 'テスト',
        readingMode: 'deep',
        narratorMode: 'classic',
        intent: '創作',
        question: '今夜の創作で何を中心に据えるべき？',
        timeframe: '今週',
        spreadId: 'sixfold',
        reversals: true,
        relationTheme: false,
        relationType: '',
        background: '試作を進めたいが、どこから形にするかで迷っている。',
      },
      {
        anchorCardNo: 17,
        history: [],
      },
    )

    const anchored = reading.positions.find((position) => position.cardNo === 17)

    expect(reading.anchorCardNo).toBe(17)
    expect(reading.keyCardNo).toBe(17)
    expect(anchored).toBeDefined()
    expect(reading.keyCardReason).toBe(
      `${anchored?.label}に置かれた${anchored?.cardName}は、あなた自身の手で引き寄せた一枚であり、今回の読みの中心として静かに立っています。`,
    )
  })

  it('keeps fallback key-card selection valid when anchorCardNo is null', () => {
    const reading = createReading(
      {
        nickname: 'テスト',
        readingMode: 'quick',
        narratorMode: 'classic',
        intent: 'メンタル',
        question: 'いま心を守るには何を優先するとよい？',
        timeframe: '今日',
        spreadId: 'sixfold',
        reversals: false,
        relationTheme: false,
        relationType: '',
        background: '',
      },
      {
        anchorCardNo: null,
        history: [],
      },
    )

    expect(reading.anchorCardNo).toBeNull()
    expect(reading.positions.some((position) => position.cardNo === reading.keyCardNo)).toBe(true)
    expect(reading.keyCardReason.length).toBeGreaterThan(0)
  })

  it('avoids repeated tail sentences across Reading Sequence card bodies', () => {
    const reading = createReading(
      {
        nickname: 'テスト',
        readingMode: 'quick',
        narratorMode: 'classic',
        intent: '仕事',
        question: '今週の仕事で、最初に整えることは？',
        timeframe: '今週',
        spreadId: 'sixfold',
        reversals: false,
        relationTheme: false,
        relationType: '',
        background: '',
      },
      {
        anchorCardNo: 1,
        history: [],
      },
    )

    const mediumTails = reading.positions.map((position) => tailSentence(position.medium))
    const shortTails = reading.positions.map((position) => tailSentence(position.short))

    expect(new Set(mediumTails).size).toBe(mediumTails.length)
    expect(new Set(shortTails).size).toBe(shortTails.length)
  })

  it('can switch to the geo guide narrator without changing the reading shape', () => {
    const reading = createReading(
      {
        nickname: 'テスト',
        readingMode: 'quick',
        narratorMode: 'geoGuide',
        intent: '仕事',
        question: '今週の仕事で何を優先するべき？',
        timeframe: '今週',
        spreadId: 'sixfold',
        reversals: false,
        relationTheme: false,
        relationType: '',
        background: '',
      },
      {
        anchorCardNo: 1,
        history: [],
      },
    )

    const snapshot = buildReadingSnapshot(reading)

    expect(reading.input.narratorMode).toBe('geoGuide')
    expect(geoSummaryIntroVariants.some((intro) => reading.summary.medium.startsWith(intro))).toBe(true)
    expect(geoSummaryClosingVariants.some((closing) => reading.summary.medium.endsWith(closing))).toBe(true)
    expect(reading.positions).toHaveLength(reading.spread.cardCount)
    expect(reading.positions.map((position) => position.medium).join('\n')).not.toMatch(
      /ここは気合で一歩だ。|ビビるな、俺もいる。|最後の一回で流れを変えるぞ。|札だけに、さっと動ける。/,
    )
    expect(snapshot.nextStep).not.toMatch(/俺|気合|根性|ビビ|最後の一回|札だけに|主役|中央突破/)
  })

  it('wraps geo guide summaries without rewriting the generated middle text', () => {
    const middle = '中盤本文です。ここは変えません。'
    const summary = narrateSummary(
      {
        short: middle,
        medium: middle,
        long: middle,
      },
      'geoGuide',
      'fixed-summary',
    )

    expect(summary.medium).toContain(middle)
    expect(geoSummaryIntroVariants.some((intro) => summary.medium.startsWith(intro))).toBe(true)
    expect(geoSummaryClosingVariants.some((closing) => summary.medium.endsWith(closing))).toBe(true)
  })

  it('keeps geo guide summary variants free of forbidden character wording', () => {
    expect(geoSummaryIntroVariants).toHaveLength(30)
    expect(geoSummaryClosingVariants).toHaveLength(30)

    for (const variant of [...geoSummaryIntroVariants, ...geoSummaryClosingVariants]) {
      expect(variant).not.toContain('主人公')
      expect(variant).not.toContain('おばけ')
    }
  })
})
