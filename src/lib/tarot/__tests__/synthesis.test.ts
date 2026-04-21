import { describe, expect, it } from 'vitest'
import { cards, spreads, type IntentCategory, type ReadingLength, type TimeframeOption } from '../../../data/tarot'
import type { ReadingPositionResult, ReadingResult } from '../../readingEngine'
import { getStructuredCardByNo } from '../cards'
import { generateReadingFromCardData } from '../generateReading'
import { buildReadingHistorySnapshot } from '../history'
import {
  buildSynthesisSnapshot,
  buildSynthesisSummary,
  buildSynthesisTotalComment,
  resolveFragmentPool,
  type BuiltSynthesisSnapshot,
} from '../synthesis'
import type { ReadingSnapshot as TarotReadingSnapshot, Topic, Tone } from '../types'

function createSeededRng(seed: number) {
  let state = seed >>> 0

  return () => {
    state = (1664525 * state + 1013904223) >>> 0
    return state / 0x100000000
  }
}

function mapTopic(intent: IntentCategory): Topic {
  switch (intent) {
    case '恋愛':
      return 'love'
    case '人間関係':
      return 'relationship'
    case '仕事':
    case '配信活動':
    case '創作':
      return 'work'
    case '学業':
    case 'メンタル':
    case 'その他':
      return 'self'
  }
}

function mapTone(readingMode: 'quick' | 'deep'): Tone {
  return readingMode === 'quick' ? 'tender' : 'oracular'
}

function buildPosition(
  cardNo: number,
  reversed: boolean,
  label: string,
  prompt: string,
  intent: IntentCategory,
  readingMode: 'quick' | 'deep',
  history: ReadonlyArray<TarotReadingSnapshot>,
  seedBase: number,
): ReadingPositionResult {
  const card = cards.find((entry) => entry.no === cardNo)
  const structuredCard = getStructuredCardByNo(cardNo)

  if (!card || !structuredCard) {
    throw new Error(`Missing card: ${cardNo}`)
  }

  const topic = mapTopic(intent)
  const tone = mapTone(readingMode)
  const position = reversed ? 'reversed' : 'upright'

  const generated = {
    short: generateReadingFromCardData(
      structuredCard,
      { cardId: structuredCard.id, topic, tone, length: 'short', position },
      { rng: createSeededRng(seedBase + 1), history },
    ),
    medium: generateReadingFromCardData(
      structuredCard,
      { cardId: structuredCard.id, topic, tone, length: 'medium', position },
      { rng: createSeededRng(seedBase + 2), history },
    ),
    long: generateReadingFromCardData(
      structuredCard,
      { cardId: structuredCard.id, topic, tone, length: 'long', position },
      { rng: createSeededRng(seedBase + 3), history },
    ),
  }

  return {
    label,
    prompt,
    cardNo,
    cardName: card.arcana,
    personLabel: card.person,
    roleLabel: card.role,
    motif: card.motif,
    reversed,
    short: generated.short.body,
    medium: generated.medium.body,
    long: generated.long.body,
    generated,
    historySnapshot: buildReadingHistorySnapshot(generated.medium),
  }
}

function createReadingFixture(
  intent: IntentCategory = '恋愛',
  timeframe: TimeframeOption = '今日',
  readingMode: 'quick' | 'deep' = 'deep',
): ReadingResult {
  const spread = spreads.find((entry) => entry.id === 'sixfold')

  if (!spread) {
    throw new Error('Missing sixfold spread')
  }

  const cardOrder = [
    { cardNo: 5, reversed: false },
    { cardNo: 18, reversed: false },
    { cardNo: 10, reversed: false },
    { cardNo: 4, reversed: false },
    { cardNo: 8, reversed: true },
    { cardNo: 20, reversed: false },
  ]

  const rollingHistory: TarotReadingSnapshot[] = []
  const positions = spread.positions.map((position, index) => {
    const built = buildPosition(
      cardOrder[index].cardNo,
      cardOrder[index].reversed,
      position.label,
      position.prompt,
      intent,
      readingMode,
      rollingHistory,
      1200 + index * 20,
    )
    rollingHistory.unshift(built.historySnapshot)
    return built
  })

  return {
    id: `fixture-${intent}-${timeframe}-${readingMode}`,
    createdAt: '2026-04-21T00:00:00.000Z',
    input: {
      nickname: 'テスト',
      readingMode,
      intent,
      question: 'いま最も重い輪郭を知りたい',
      timeframe,
      spreadId: 'sixfold',
      reversals: true,
      relationTheme: intent === '恋愛' || intent === '人間関係',
      relationType: intent === '恋愛' ? '気になる相手' : '身近な関係',
      background: '最近は気配が揺れやすく、言葉より空気のほうが気になっている。',
    },
    spread,
    keyCardNo: 18,
    keyCardReason: '現在札がもっとも重く、全体の輪郭を集めているため。',
    pairFocus: ['観測の性質が複数位置で重なり、今夜の読み全体に同じ手触りを残しています。'],
    summary: {
      short: '',
      medium: '',
      long: '',
    },
    totalComment: '',
    positions,
    disclaimer: '',
    anchorCardNo: 18,
    generatedHistorySnapshots: positions.map((position) => position.historySnapshot),
  }
}

function inRange(length: number, min: number, max: number) {
  return length >= min && length <= max
}

function splitSentences(text: string) {
  return text
    .split(/[。！？]/)
    .map((entry) => entry.trim())
    .filter(Boolean)
}

describe('synthesis layer', () => {
  it('is deterministic for the same input and seed', () => {
    const reading = createReadingFixture('恋愛', '今日', 'deep')
    const totalA = buildSynthesisTotalComment({
      reading,
      length: 'long',
      rng: createSeededRng(77),
    })
    const totalB = buildSynthesisTotalComment({
      reading,
      length: 'long',
      rng: createSeededRng(77),
    })
    const summaryA = buildSynthesisSummary({
      reading,
      length: 'medium',
      rng: createSeededRng(101),
    })
    const summaryB = buildSynthesisSummary({
      reading,
      length: 'medium',
      rng: createSeededRng(101),
    })
    const snapshotA = buildSynthesisSnapshot(reading, createSeededRng(121))
    const snapshotB = buildSynthesisSnapshot(reading, createSeededRng(121))

    expect(totalA.text).toBe(totalB.text)
    expect(summaryA.text).toBe(summaryB.text)
    expect(snapshotA.nextStep).toBe(snapshotB.nextStep)
  })

  it('keeps fragment ids and sentences deduplicated inside one total comment', () => {
    const reading = createReadingFixture('仕事', '今週', 'deep')
    const result = buildSynthesisTotalComment({
      reading,
      length: 'long',
      rng: createSeededRng(22),
    })

    expect(new Set(result.usedFragmentIds).size).toBe(result.usedFragmentIds.length)

    const bodySentences = splitSentences(result.text)
    expect(new Set(bodySentences).size).toBe(bodySentences.length)
  })

  it('falls back gracefully when later filters would empty the pool', () => {
    const reading = createReadingFixture('恋愛', '今日', 'deep')
    const pool = resolveFragmentPool(
      'intentClosing',
      {
        reading,
        length: 'medium',
        tone: 'oracular',
        dominantPosition: 'upright',
      },
      new Set<string>(),
      [
        {
          id: 'custom-intent-closing',
          slot: 'intentClosing',
          text: '試験用の断片です',
          intents: ['仕事'],
        },
      ],
    )

    expect(pool).toHaveLength(1)
    expect(pool[0]?.id).toBe('custom-intent-closing')
  })

  it('meets uniqueness and fragment spread targets under a fixed condition', () => {
    const reading = createReadingFixture('恋愛', '今日', 'deep')
    const totalOutputs = new Set<string>()
    const summaryOutputs = new Set<string>()
    const nextStepOutputs = new Set<string>()
    const fragmentUsage = new Map<string, number>()

    for (let seed = 1; seed <= 1000; seed += 1) {
      const total = buildSynthesisTotalComment({
        reading,
        length: 'long',
        rng: createSeededRng(seed),
      })
      const summary = buildSynthesisSummary({
        reading,
        length: 'medium',
        rng: createSeededRng(seed + 2000),
      })
      const snapshot = buildSynthesisSnapshot(reading, createSeededRng(seed + 4000))

      totalOutputs.add(total.text)
      summaryOutputs.add(summary.text)
      nextStepOutputs.add(snapshot.nextStep)

      for (const fragmentId of [
        ...total.usedFragmentIds,
        ...summary.usedFragmentIds,
        ...snapshot.usedFragmentIds,
      ]) {
        fragmentUsage.set(fragmentId, (fragmentUsage.get(fragmentId) ?? 0) + 1)
      }
    }

    const totalRate = totalOutputs.size / 1000
    const summaryRate = summaryOutputs.size / 1000
    const nextStepRate = nextStepOutputs.size / 1000
    const maxFragmentUsage = Math.max(
      ...[...fragmentUsage.values()].map((count) => count / 1000),
    )

    console.log('totalComment unique rate', totalRate)
    console.log('summary.medium unique rate', summaryRate)
    console.log('snapshot.nextStep unique rate', nextStepRate)
    console.log('max fragment usage', maxFragmentUsage)

    expect(totalRate).toBeGreaterThanOrEqual(0.95)
    expect(summaryRate).toBeGreaterThanOrEqual(0.95)
    expect(nextStepRate).toBeGreaterThanOrEqual(0.9)
    expect(maxFragmentUsage).toBeLessThanOrEqual(0.3)
  })

  it('keeps at least 90 percent of outputs within the target length ranges', () => {
    const lengths: ReadingLength[] = ['short', 'medium', 'long']
    let totalInRange = 0
    let summaryInRange = 0
    let snapshotInRange = 0

    for (let seed = 1; seed <= 200; seed += 1) {
      const reading = createReadingFixture(
        (['恋愛', '仕事', '創作', '人間関係'][seed % 4] ?? '恋愛') as IntentCategory,
        (['今日', '今週', '来週', '今年'][seed % 4] ?? '今日') as TimeframeOption,
        seed % 2 === 0 ? 'quick' : 'deep',
      )

      const total = buildSynthesisTotalComment({
        reading,
        length: 'long',
        rng: createSeededRng(seed + 500),
      })

      if (inRange(total.text.length, 360, 520)) {
        totalInRange += 1
      }

      for (const length of lengths) {
        const summary = buildSynthesisSummary({
          reading,
          length,
          rng: createSeededRng(seed * 10 + length.length),
        })
        const ranges = {
          short: [90, 150],
          medium: [195, 325],
          long: [315, 525],
        } as const

        if (inRange(summary.text.length, ranges[length][0], ranges[length][1])) {
          summaryInRange += 1
        }
      }

      const snapshot = buildSynthesisSnapshot(reading, createSeededRng(seed + 800))
      if (
        inRange(snapshot.headline.length, 40, 90) &&
        inRange(snapshot.focus.length, 40, 90) &&
        inRange(snapshot.nextStep.length, 35, 80) &&
        inRange(snapshot.caution.length, 40, 100) &&
        inRange(snapshot.historyLine.length, 30, 80)
      ) {
        snapshotInRange += 1
      }
    }

    console.log('totalComment range ratio', totalInRange / 200)
    console.log('summary range ratio', summaryInRange / 600)
    console.log('snapshot range ratio', snapshotInRange / 200)

    expect(totalInRange / 200).toBeGreaterThanOrEqual(0.9)
    expect(summaryInRange / 600).toBeGreaterThanOrEqual(0.9)
    expect(snapshotInRange / 200).toBeGreaterThanOrEqual(0.9)
  })

  it('keeps forbidden words out of random outputs', () => {
    const forbidden = ['ラッキー', 'ヤバい', 'めちゃくちゃ', '絶対', '最高', 'バッチリ', '超', 'マジ']

    for (let seed = 1; seed <= 500; seed += 1) {
      const reading = createReadingFixture('恋愛', '今日', seed % 2 === 0 ? 'quick' : 'deep')
      const total = buildSynthesisTotalComment({
        reading,
        length: 'long',
        rng: createSeededRng(seed + 1000),
      })
      const summary = buildSynthesisSummary({
        reading,
        length: 'medium',
        rng: createSeededRng(seed + 2000),
      })
      const snapshot: BuiltSynthesisSnapshot = buildSynthesisSnapshot(
        reading,
        createSeededRng(seed + 3000),
      )
      const joined = `${total.text} ${summary.text} ${snapshot.headline} ${snapshot.focus} ${snapshot.nextStep} ${snapshot.caution}`

      for (const word of forbidden) {
        expect(joined.includes(word)).toBe(false)
      }
    }
  })
})
