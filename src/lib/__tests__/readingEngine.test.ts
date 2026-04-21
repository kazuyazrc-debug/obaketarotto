import { describe, expect, it } from 'vitest'
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
      intent: '恋愛',
      question: '相手との距離感をどう整えるべき？',
      timeframe: '今週',
      spreadId: 'sixfold',
      reversals: false,
      relationTheme: true,
      relationType: '気になる相手',
      background: '最近はやり取りがあるけれど、空気が読みにくい。',
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
})
