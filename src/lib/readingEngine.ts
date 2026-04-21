import {
  cards,
  defaultDisclaimer,
  spreads,
  type IntentCategory,
  type ReadingLength,
  type SpreadDefinition,
  type SpreadId,
  type TimeframeOption,
} from '../data/tarot'
import { getStructuredCardByNo } from './tarot/cards'
import { buildReadingHistorySnapshot } from './tarot/history'
import { generateReadingFromCardData } from './tarot/generateReading'
import {
  buildSynthesisSnapshot,
  buildSynthesisSummary,
  buildSynthesisTotalComment,
  type SynthesisDebugEntry,
} from './tarot/synthesis'
import type {
  Position as TarotPosition,
  Reading as TarotReading,
  ReadingSnapshot as TarotReadingSnapshot,
  Topic,
  Tone,
} from './tarot/types'

export type DrawnCard = {
  no: number
  reversed: boolean
}

export type ReadingInput = {
  nickname: string
  readingMode: 'quick' | 'deep'
  intent: IntentCategory
  question: string
  timeframe: TimeframeOption
  spreadId: SpreadId
  reversals: boolean
  relationTheme: boolean
  relationType: string
  background: string
}

export type ReadingPositionResult = {
  label: string
  prompt: string
  cardNo: number
  cardName: string
  personLabel: string
  roleLabel: string
  motif: string
  reversed: boolean
  short: string
  medium: string
  long: string
  generated: Record<ReadingLength, TarotReading>
  historySnapshot: TarotReadingSnapshot
}

export type ReadingResult = {
  id: string
  createdAt: string
  input: ReadingInput
  spread: SpreadDefinition
  keyCardNo: number
  keyCardReason: string
  pairFocus: string[]
  summary: Record<ReadingLength, string>
  totalComment: string
  positions: ReadingPositionResult[]
  disclaimer: string
  anchorCardNo: number | null
  generatedHistorySnapshots: TarotReadingSnapshot[]
  synthesisDebug?: {
    totalComment: SynthesisDebugEntry[]
    summary: Record<ReadingLength, SynthesisDebugEntry[]>
  }
}

export type ReadingSnapshot = {
  headline: string
  focus: string
  nextStep: string
  caution: string
  historyLine: string
  synthesisDebug?: SynthesisDebugEntry[]
}

type CreateReadingOptions = {
  anchorCardNo?: number | null
  history?: ReadonlyArray<TarotReadingSnapshot>
}

const topicByIntent: Record<IntentCategory, Topic> = {
  恋愛: 'love',
  人間関係: 'relationship',
  仕事: 'work',
  配信活動: 'work',
  創作: 'work',
  学業: 'self',
  メンタル: 'self',
  その他: 'self',
}

export function createReading(
  input: ReadingInput,
  options: CreateReadingOptions = {},
): ReadingResult {
  const spread = spreads.find((entry) => entry.id === input.spreadId) ?? spreads[2]
  const createdAt = new Date().toISOString()
  const id = `${Date.now()}`
  const deck = drawCards(spread.cardCount, input.reversals, options.anchorCardNo ?? null)
  const rollingHistory = [...(options.history ?? [])]

  const positions = spread.positions.map((position, index) => {
    const built = buildPositionResult(
      position,
      deck[index],
      input,
      createdAt,
      rollingHistory,
      `${id}:${position.label}:${index}`,
    )
    rollingHistory.unshift(built.historySnapshot)
    return built
  })

  const keyCard = chooseKeyCard(positions, spread, options.anchorCardNo ?? null)
  const pairFocus = buildPairFocus(positions)
  const baseReading: ReadingResult = {
    id,
    createdAt,
    input,
    spread,
    keyCardNo: keyCard.cardNo,
    keyCardReason: keyCard.reason,
    pairFocus,
    summary: {
      short: '',
      medium: '',
      long: '',
    },
    totalComment: '',
    positions,
    disclaimer: defaultDisclaimer,
    anchorCardNo: options.anchorCardNo ?? null,
    generatedHistorySnapshots: positions.map((position) => position.historySnapshot),
  }
  const summary = buildSummary(baseReading)
  const totalComment = buildTotalComment(baseReading)

  return {
    ...baseReading,
    summary: summary.text,
    totalComment: totalComment.text,
    synthesisDebug: {
      totalComment: totalComment.debugTrace,
      summary: summary.debugTrace,
    },
  }
}

function drawCards(count: number, reversals: boolean, anchorCardNo: number | null): DrawnCard[] {
  const pool = [...cards]
  const drawn: DrawnCard[] = []

  if (anchorCardNo !== null) {
    const anchorIndex = pool.findIndex((card) => card.no === anchorCardNo)
    if (anchorIndex >= 0) {
      const [anchorCard] = pool.splice(anchorIndex, 1)
      drawn.push({
        no: anchorCard.no,
        reversed: reversals ? Math.random() < 0.35 : false,
      })
    }
  }

  while (drawn.length < count && pool.length > 0) {
    const index = Math.floor(Math.random() * pool.length)
    const [card] = pool.splice(index, 1)

    drawn.push({
      no: card.no,
      reversed: reversals ? Math.random() < 0.35 : false,
    })
  }

  return shuffle(drawn)
}

function buildPositionResult(
  position: SpreadDefinition['positions'][number],
  drawnCard: DrawnCard,
  input: ReadingInput,
  createdAt: string,
  history: ReadonlyArray<TarotReadingSnapshot>,
  seedKey: string,
): ReadingPositionResult {
  const card = cards.find((entry) => entry.no === drawnCard.no)
  const structuredCard = getStructuredCardByNo(drawnCard.no)

  if (!card || !structuredCard) {
    throw new Error(`Card ${drawnCard.no} not found`)
  }

  const topic = topicByIntent[input.intent]
  const tone = mapTone(input.readingMode)
  const positionValue: TarotPosition = drawnCard.reversed ? 'reversed' : 'upright'

  const generated = {
    short: generateReadingFromCardData(
      structuredCard,
      {
        cardId: structuredCard.id,
        topic,
        tone,
        length: 'short',
        position: positionValue,
      },
      { rng: createSeededRng(hashString(`${seedKey}:short:${createdAt}`)), history },
    ),
    medium: generateReadingFromCardData(
      structuredCard,
      {
        cardId: structuredCard.id,
        topic,
        tone,
        length: 'medium',
        position: positionValue,
      },
      { rng: createSeededRng(hashString(`${seedKey}:medium:${createdAt}`)), history },
    ),
    long: generateReadingFromCardData(
      structuredCard,
      {
        cardId: structuredCard.id,
        topic,
        tone,
        length: 'long',
        position: positionValue,
      },
      { rng: createSeededRng(hashString(`${seedKey}:long:${createdAt}`)), history },
    ),
  }

  return {
    label: position.label,
    prompt: position.prompt,
    cardNo: card.no,
    cardName: card.arcana,
    personLabel: card.person,
    roleLabel: card.role,
    motif: card.motif,
    reversed: drawnCard.reversed,
    short: generated.short.body,
    medium: generated.medium.body,
    long: generated.long.body,
    generated,
    historySnapshot: buildReadingHistorySnapshot(generated.medium),
  }
}

function chooseKeyCard(
  positions: ReadingPositionResult[],
  spread: SpreadDefinition,
  anchorCardNo: number | null,
) {
  if (anchorCardNo !== null) {
    const anchored = positions.find((position) => position.cardNo === anchorCardNo)

    if (anchored) {
      return {
        ...anchored,
        reason: `${anchored.label}に置かれた${anchored.cardName}は、あなた自身の手で引き寄せた一枚であり、今回の読みの中心として静かに立っています。`,
      }
    }
  }

  let bestIndex = 0
  let bestScore = Number.NEGATIVE_INFINITY

  positions.forEach((position, index) => {
    const spreadWeight = spread.positions[index]?.weight ?? 0.5
    const reversalAdjustment = position.reversed ? -0.2 : 0
    const score = spreadWeight * 10 + position.generated.medium.keywords.length / 10 + reversalAdjustment

    if (score > bestScore) {
      bestScore = score
      bestIndex = index
    }
  })

  const picked = positions[bestIndex]

  return {
    ...picked,
    reason: `${picked.label}は今回の星図で最も重みが高く、${picked.cardName}が示す「${excerpt(
      picked.medium,
      1,
    )}」という流れが読み全体の中心に集まっています。`,
  }
}

function buildPairFocus(positions: ReadingPositionResult[]) {
  const roleCounts = positions.reduce<Record<string, number>>((accumulator, position) => {
    accumulator[position.roleLabel] = (accumulator[position.roleLabel] ?? 0) + 1
    return accumulator
  }, {})

  return Object.entries(roleCounts)
    .filter(([, count]) => count >= 2)
    .map(
      ([role]) =>
        `${role}の性質が複数位置で重なり、今夜の読み全体に同じ手触りを残しています。`,
    )
}

function buildSummary(
  reading: ReadingResult,
): {
  text: Record<ReadingLength, string>
  debugTrace: Record<ReadingLength, SynthesisDebugEntry[]>
} {
  const short = buildSynthesisSummary({
      reading,
      length: 'short',
      rng: createSeededRng(hashString(`${reading.id}:synthesis:summary:short`)),
    })
  const medium = buildSynthesisSummary({
      reading,
      length: 'medium',
      rng: createSeededRng(hashString(`${reading.id}:synthesis:summary:medium`)),
    })
  const long = buildSynthesisSummary({
      reading,
      length: 'long',
      rng: createSeededRng(hashString(`${reading.id}:synthesis:summary:long`)),
    })

  return {
    text: {
      short: short.text,
      medium: medium.text,
      long: long.text,
    },
    debugTrace: {
      short: short.debugTrace,
      medium: medium.debugTrace,
      long: long.debugTrace,
    },
  }
}

function buildTotalComment(
  reading: ReadingResult,
) {
  return buildSynthesisTotalComment({
    reading,
    length: 'long',
    rng: createSeededRng(hashString(`${reading.id}:synthesis:totalComment`)),
  })
}

export function buildReadingSnapshot(reading: ReadingResult): ReadingSnapshot {
  const snapshot = buildSynthesisSnapshot(
    reading,
    createSeededRng(hashString(`${reading.id}:synthesis:snapshot`)),
  )

  return {
    headline: snapshot.headline,
    focus: snapshot.focus,
    nextStep: snapshot.nextStep,
    caution: snapshot.caution,
    historyLine: snapshot.historyLine,
    synthesisDebug: snapshot.debugTrace,
  }
}

function mapTone(readingMode: ReadingInput['readingMode']): Tone {
  return readingMode === 'quick' ? 'tender' : 'oracular'
}

function splitSentences(text: string) {
  return text
    .split(/[。！？]/)
    .map((segment) => segment.trim())
    .filter(Boolean)
}

function excerpt(text: string, sentenceCount: number) {
  const sentences = splitSentences(text)
  return sentences.slice(0, sentenceCount).join('。')
}

function shuffle<T>(items: T[]) {
  const next = [...items]

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[next[index], next[swapIndex]] = [next[swapIndex], next[index]]
  }

  return next
}

function hashString(value: string) {
  let hash = 2166136261

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return hash >>> 0
}

function createSeededRng(seed: number) {
  let state = seed >>> 0

  return () => {
    state = (1664525 * state + 1013904223) >>> 0
    return state / 0x100000000
  }
}
