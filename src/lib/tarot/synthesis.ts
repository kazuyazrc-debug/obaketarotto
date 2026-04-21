import type { ReadingLength } from '../../data/tarot'
import { getRecipientLabel, sanitizeReadingText } from '../readingDisplay'
import type {
  ReadingInput as EngineReadingInput,
  ReadingPositionResult,
  ReadingResult,
  ReadingSnapshot,
} from '../readingEngine'
import {
  synthesisFragments,
  type SynthesisFragment,
  type SynthesisSlot,
} from './synthesisFragments'
import type {
  Position,
  Reading as TarotReading,
  Tone,
} from './types'

export type SynthesisInput = {
  reading: ReadingResult
  length: ReadingLength
  rng: () => number
}

export type PickSentencesOptions = {
  count: number
  prefer?: 'advice' | 'state' | 'hidden' | 'closing'
  avoid?: ReadonlyArray<string>
  minChars?: number
  maxChars?: number
}

export type EndingType =
  | 'continuous'
  | 'polite'
  | 'noun'
  | 'speculative'
  | 'afterglow'
  | 'past'
  | 'other'

export type SynthesisDebugEntry = {
  section: string
  kind: 'fragment' | 'positionSentence'
  text: string
  slot?: SynthesisSlot
  fragmentId?: string
  positionLabel?: string
  cardName?: string
  readingLength?: ReadingLength
  prefer?: NonNullable<PickSentencesOptions['prefer']>
}

export type BuiltSynthesisText = {
  text: string
  usedFragmentIds: string[]
  usedSentences: string[]
  debugNotes: string[]
  debugTrace: SynthesisDebugEntry[]
}

export type BuiltSynthesisSnapshot = ReadingSnapshot & {
  usedFragmentIds: string[]
  usedSentences: string[]
  debugNotes: string[]
  debugTrace: SynthesisDebugEntry[]
}

type RenderPlaceholderKey =
  | 'cardName'
  | 'keyCardName'
  | 'pastCardName'
  | 'nowCardName'
  | 'futureCardName'
  | 'methodCardName'
  | 'mindsetCardName'
  | 'fortuneCardName'
  | 'excerpt'
  | 'excerpt2'
  | 'excerpt3'
  | 'intent'
  | 'timeframe'
  | 'recipient'
  | 'pairFocus'

type RenderPlaceholderMap = Partial<Record<RenderPlaceholderKey, string>>

type SynthesisContext = {
  reading: ReadingResult
  length: ReadingLength
  rng: () => number
  tone: Tone
  dominantPosition: Position
  recipient: string
  keyPosition: ReadingPositionResult
  past: ReadingPositionResult
  now: ReadingPositionResult
  future: ReadingPositionResult
  method: ReadingPositionResult
  mindset: ReadingPositionResult
  fortune: ReadingPositionResult
  placeholders: RenderPlaceholderMap
  cardNames: string[]
}

type BuildState = {
  rng: () => number
  usedFragmentIds: Set<string>
  usedSentences: Set<string>
  usedCardCounts: Map<string, number>
  previousEndingType: EndingType | null
  debugNotes: string[]
  debugTrace: SynthesisDebugEntry[]
}

type SlotPickOptions = {
  placeholders?: RenderPlaceholderMap
  guardEndingType?: boolean
  debugSection?: string
}

type LengthTarget = {
  min: number
  max: number
  target: number
}

const roleKeywordHints: Record<NonNullable<PickSentencesOptions['prefer']>, string[]> = {
  advice: ['勧める', 'ほうがやさしい', '一歩', '合図'],
  state: ['いま', '流れ', '濃く', '輪郭'],
  hidden: ['まだ', '奥', '裏', '見えていない'],
  closing: ['告げる', '静かに', '次章', '開いていく'],
}

const nounEndingWords = [
  'こと',
  '瞬間',
  '一点',
  '夜',
  '気配',
  '余韻',
  '構図',
  '入口',
  '合図',
  '土台',
  '輪郭',
  '道筋',
  '順路',
  '局面',
  '予感',
  '気流',
  '配列',
  '線',
  '背景',
  '説明',
  '流れ',
  '段取り',
  '手つき',
]

const repeatedAdverbs = ['静かに', 'そっと', 'ゆっくり', '淡く', 'やさしく']
const warnedUnknownPlaceholders = new Set<string>()

const summaryTargets: Record<ReadingLength, LengthTarget> = {
  short: { min: 90, max: 150, target: 120 },
  medium: { min: 195, max: 325, target: 260 },
  long: { min: 315, max: 525, target: 420 },
}

const totalCommentTarget: LengthTarget = {
  min: 360,
  max: 520,
  target: 440,
}

const snapshotTargets = {
  headline: { min: 40, max: 90, target: 64 },
  focus: { min: 40, max: 90, target: 64 },
  nextStep: { min: 35, max: 80, target: 56 },
  caution: { min: 40, max: 100, target: 70 },
  historyLine: { min: 30, max: 80, target: 52 },
}

/**
 * Pick semantically useful sentences from one generated tarot reading.
 */
export function pickSentences(reading: TarotReading, opts: PickSentencesOptions): string[] {
  const count = Math.max(1, Math.min(3, opts.count))
  const minChars = opts.minChars ?? 12
  const maxChars = opts.maxChars ?? 80
  const avoid = opts.avoid ?? []
  const roleHints = opts.prefer ? roleKeywordHints[opts.prefer] : []

  const candidates = splitIntoSentences(reading.body)
    .map((sentence, index) => ({
      sentence,
      index,
      score: scoreSentence(sentence, reading, roleHints, avoid),
    }))
    .filter(({ sentence }) => sentence.length >= minChars && sentence.length <= maxChars)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score
      }

      const leftDistance = Math.abs(left.sentence.length - 40)
      const rightDistance = Math.abs(right.sentence.length - 40)

      if (leftDistance !== rightDistance) {
        return leftDistance - rightDistance
      }

      return left.index - right.index
    })

  const selected: string[] = []

  for (const candidate of candidates) {
    if (selected.includes(candidate.sentence)) {
      continue
    }

    selected.push(candidate.sentence)

    if (selected.length >= count) {
      break
    }
  }

  return selected
}

export function detectEndingType(text: string): EndingType {
  const trimmed = stripTrailingPunctuation(text)

  if (trimmed.endsWith('ました')) {
    return 'past'
  }

  if (trimmed.endsWith('ています')) {
    return 'continuous'
  }

  if (
    trimmed.endsWith('ます') ||
    trimmed.endsWith('ません') ||
    trimmed.endsWith('ください')
  ) {
    return 'polite'
  }

  if (trimmed.endsWith('でしょう') || trimmed.endsWith('かもしれません')) {
    return 'speculative'
  }

  if (trimmed.endsWith('です')) {
    return 'afterglow'
  }

  if (nounEndingWords.some((word) => trimmed.endsWith(word))) {
    return 'noun'
  }

  return 'other'
}

export function resolveFragmentPool(
  slot: SynthesisSlot,
  context: Pick<SynthesisContext, 'length' | 'tone' | 'dominantPosition' | 'reading'>,
  usedFragmentIds: ReadonlySet<string>,
  source: ReadonlyArray<SynthesisFragment> = synthesisFragments,
): SynthesisFragment[] {
  const slotPool = source.filter((fragment) => fragment.slot === slot)
  const effectiveTone = context.tone
  const filters = [
    (fragment: SynthesisFragment) =>
      !fragment.tones || fragment.tones.includes(effectiveTone),
    (fragment: SynthesisFragment) =>
      !fragment.lengths || fragment.lengths.includes(context.length),
    (fragment: SynthesisFragment) =>
      !fragment.position ||
      fragment.position === 'any' ||
      fragment.position === context.dominantPosition,
    (fragment: SynthesisFragment) =>
      !fragment.intents || fragment.intents.includes(context.reading.input.intent),
    (fragment: SynthesisFragment) =>
      !fragment.timeframes || fragment.timeframes.includes(context.reading.input.timeframe),
  ]

  for (let keepFilters = filters.length; keepFilters >= 0; keepFilters -= 1) {
    let candidates = slotPool.filter((fragment) => !usedFragmentIds.has(fragment.id))

    for (let index = 0; index < keepFilters; index += 1) {
      candidates = candidates.filter(filters[index])
    }

    if (candidates.length > 0) {
      return candidates
    }
  }

  const withoutReuse = slotPool.filter((fragment) => !usedFragmentIds.has(fragment.id))

  if (withoutReuse.length > 0) {
    return withoutReuse
  }

  return slotPool
}

export function buildSynthesisTotalComment(input: SynthesisInput): BuiltSynthesisText {
  return buildWithAttempts(
    totalCommentTarget,
    () => {
      const context = createSynthesisContext(input)
      const state = createBuildState(input.rng)
      const parts: string[] = []

      const pastExcerpt = pickPositionSnippet(
        context.past,
        ['short', 'medium'],
        'hidden',
        state,
        28,
        'totalComment',
      )
      const nowExcerpt = pickPositionSnippet(
        context.now,
        ['medium', 'long'],
        'state',
        state,
        34,
        'totalComment',
      )
      const futureExcerpt = pickPositionSnippet(
        context.future,
        ['short', 'medium'],
        'closing',
        state,
        28,
        'totalComment',
      )
      const methodExcerpt = pickPositionSnippet(
        context.method,
        ['short', 'medium'],
        'advice',
        state,
        26,
        'totalComment',
      )
      const mindsetExcerpt = pickPositionSnippet(
        context.mindset,
        ['short', 'medium'],
        'hidden',
        state,
        24,
        'totalComment',
      )
      const fortuneExcerpt = pickPositionSnippet(
        context.fortune,
        ['short', 'medium'],
        'closing',
        state,
        22,
        'totalComment',
      )

      parts.push(
        pickSlotText('totalComment.opener', context, state, {
          guardEndingType: true,
          debugSection: 'totalComment',
        }),
        pickSlotText('totalComment.pastBridge', context, state, {
          guardEndingType: true,
          debugSection: 'totalComment',
          placeholders: { excerpt: pastExcerpt },
        }),
        pickSlotText('totalComment.presentBridge', context, state, {
          guardEndingType: true,
          debugSection: 'totalComment',
          placeholders: { excerpt: nowExcerpt },
        }),
        pickSlotText('totalComment.futureBridge', context, state, {
          guardEndingType: true,
          debugSection: 'totalComment',
          placeholders: { excerpt: futureExcerpt },
        }),
        pickSlotText('totalComment.methodPhrase', context, state, {
          guardEndingType: true,
          debugSection: 'totalComment',
          placeholders: { excerpt2: methodExcerpt },
        }),
        pickSlotText('totalComment.mindsetPhrase', context, state, {
          guardEndingType: true,
          debugSection: 'totalComment',
          placeholders: { excerpt2: mindsetExcerpt },
        }),
        pickSlotText('totalComment.fortunePhrase', context, state, {
          guardEndingType: true,
          debugSection: 'totalComment',
          placeholders: { excerpt3: fortuneExcerpt },
        }),
      )

      const supplementalParts: string[] = []

      if (context.reading.input.relationTheme) {
        supplementalParts.push(
          pickSlotText('totalComment.relationBridge', context, state, {
            guardEndingType: true,
            debugSection: 'totalComment',
          }),
        )
      }

      if (context.reading.input.background.trim()) {
        supplementalParts.push(
          pickSlotText('totalComment.backgroundBridge', context, state, {
            guardEndingType: true,
            debugSection: 'totalComment',
          }),
        )
      }

      if (context.reading.pairFocus[0]) {
        supplementalParts.push(
          pickSlotText('totalComment.pairBridge', context, state, {
            guardEndingType: true,
            debugSection: 'totalComment',
            placeholders: { pairFocus: condenseText(context.reading.pairFocus[0], 24) },
          }),
        )
      }

      while (supplementalParts.length > 1) {
        const index = Math.floor(state.rng() * supplementalParts.length)
        supplementalParts.splice(index, 1)
      }

      if (supplementalParts[0] && state.rng() < 0.55) {
        parts.push(supplementalParts[0])
      }

      const contextSlot = [
        'intentAngle',
        'timeframeAngle',
        'intentClosing',
      ][Math.floor(state.rng() * 3)] as 'intentAngle' | 'timeframeAngle' | 'intentClosing'

      if (state.rng() < 0.6) {
        parts.push(
          pickSlotText(contextSlot, context, state, {
            guardEndingType: true,
            debugSection: 'totalComment',
          }),
        )
      }

      parts.push(
        pickSlotText('totalComment.closing', context, state, {
          guardEndingType: true,
          debugSection: 'totalComment',
        }),
      )

      const text = finalizeParagraph(parts, context.reading)

      return {
        text,
        usedFragmentIds: [...state.usedFragmentIds],
        usedSentences: [...state.usedSentences],
        debugNotes: [...state.debugNotes],
        debugTrace: [...state.debugTrace],
      }
    },
  )
}

export function buildSynthesisSummary(input: SynthesisInput): BuiltSynthesisText {
  return buildWithAttempts(
    summaryTargets[input.length],
    () => {
      const context = createSynthesisContext(input)
      const state = createBuildState(input.rng)
      const parts: string[] = []
      const summarySection = `summary.${input.length}`
      const nowSentence = pickPositionSentence(
        context.now,
        'medium',
        'state',
        state,
        summarySection,
      )
      const futureSentence = pickPositionSentence(
        context.future,
        'medium',
        'closing',
        state,
        summarySection,
      )

      parts.push(
        pickSlotText('summary.opener', context, state, { debugSection: summarySection }),
      )

      if (input.length === 'short') {
        parts.push(
          nowSentence,
          pickSlotText('intentClosing', context, state, { debugSection: summarySection }),
        )
      }

      if (input.length === 'medium') {
        parts.push(
          nowSentence,
          pickSlotText('summary.bridge', context, state, { debugSection: summarySection }),
          futureSentence,
          pickSlotText('intentAngle', context, state, { debugSection: summarySection }),
          pickSlotText('summary.closing', context, state, { debugSection: summarySection }),
        )
      }

      if (input.length === 'long') {
        const pastSentence = pickPositionSentence(
          context.past,
          'medium',
          'hidden',
          state,
          summarySection,
        )
        const methodSentence = pickPositionSentence(
          context.method,
          'medium',
          'advice',
          state,
          summarySection,
        )
        const fortuneSentence = pickPositionSentence(
          context.fortune,
          'medium',
          'closing',
          state,
          summarySection,
        )

        parts.push(
          pastSentence,
          nowSentence,
          pickSlotText('summary.bridge', context, state, { debugSection: summarySection }),
          futureSentence,
          methodSentence,
          fortuneSentence,
          pickSlotText('intentAngle', context, state, { debugSection: summarySection }),
          pickSlotText('summary.closing', context, state, { debugSection: summarySection }),
        )
      }

      const text = finalizeParagraph(parts, context.reading)

      return {
        text,
        usedFragmentIds: [...state.usedFragmentIds],
        usedSentences: [...state.usedSentences],
        debugNotes: [...state.debugNotes],
        debugTrace: [...state.debugTrace],
      }
    },
  )
}

export function buildSynthesisSnapshot(
  reading: ReadingResult,
  rng: () => number,
): BuiltSynthesisSnapshot {
  let best: BuiltSynthesisSnapshot | null = null
  let bestScore = Number.POSITIVE_INFINITY

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const context = createSynthesisContext({
      reading,
      length: 'medium',
      rng,
    })
    const state = createBuildState(rng)
    const keyExcerpt = pickPositionSentence(
      context.keyPosition,
      'medium',
      'state',
      state,
      'snapshot.headline',
    )
    const methodExcerpt = pickPositionSentence(
      context.method,
      'short',
      'advice',
      state,
      'snapshot.focus',
    )
    const nextStepCue1 = pickSlotText('snapshot.nextStepCue', context, state, {
      debugSection: 'snapshot.nextStep',
    })
    const nextStepCue2 = pickSlotText('snapshot.nextStepCue', context, state, {
      debugSection: 'snapshot.nextStep',
    })
    const nextStepCue3 = pickSlotText('snapshot.nextStepCue', context, state, {
      debugSection: 'snapshot.nextStep',
    })
    const cautionSource = reading.positions.find((position) => position.reversed)
      ?? context.future
    const cautionExcerpt = pickPositionSentence(
      cautionSource,
      'medium',
      'closing',
      state,
      'snapshot.caution',
    )
    const historyExcerpt = pickPositionSnippet(
      context.keyPosition,
      ['short', 'medium'],
      'state',
      state,
      20,
      'snapshot.historyLine',
    )

    const headline = finalizeParagraph(
      [
        pickSlotText('snapshot.headlineOpener', context, state, { debugSection: 'snapshot.headline' }),
        keyExcerpt,
      ],
      reading,
    )
    const focus = finalizeParagraph(
      [
        pickSlotText('snapshot.focusLead', context, state, { debugSection: 'snapshot.focus' }),
        methodExcerpt,
      ],
      reading,
    )
    const nextStep = finalizeParagraph(
      [
        pickSlotText('snapshot.nextStepLead', context, state, { debugSection: 'snapshot.nextStep' }),
        `${nextStepCue1}・${nextStepCue2}・${nextStepCue3}`,
      ],
      reading,
    )
    const caution = finalizeParagraph(
      [
        pickSlotText('snapshot.cautionLead', context, state, { debugSection: 'snapshot.caution' }),
        cautionExcerpt,
      ],
      reading,
    )
    const historyLine = finalizeInline(
      pickSlotText('snapshot.historyLineFormat', context, state, {
        debugSection: 'snapshot.historyLine',
        placeholders: { excerpt: stripTrailingPunctuation(historyExcerpt) },
      }),
      reading,
    )

    const candidate: BuiltSynthesisSnapshot = {
      headline,
      focus,
      nextStep,
      caution,
      historyLine,
      usedFragmentIds: [...state.usedFragmentIds],
      usedSentences: [...state.usedSentences],
      debugNotes: [...state.debugNotes],
      debugTrace: [...state.debugTrace],
    }

    const score = scoreSnapshot(candidate)

    if (score < bestScore) {
      best = candidate
      bestScore = score
    }

    if (score === 0) {
      break
    }
  }

  return best ?? {
    headline: 'いまは、読み全体を一つの輪郭として静かに受け取る夜です。',
    focus: 'まずは気持ちと行動を切り分けて考えることが有効です。',
    nextStep: '今夜の次の一歩は、ひとつだけ整えたいことを書き出すことです。',
    caution: '今夜は大きな結論を急がないほうが、読みの示唆を受け取りやすくなります。',
    historyLine: `${reading.input.intent} / 六芒 / 静かな一歩`,
    usedFragmentIds: [],
    usedSentences: [],
    debugNotes: ['snapshot fallback used'],
    debugTrace: [],
  }
}

function buildWithAttempts(
  target: LengthTarget,
  builder: () => BuiltSynthesisText,
): BuiltSynthesisText {
  let best: BuiltSynthesisText | null = null
  let bestDistance = Number.POSITIVE_INFINITY

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const candidate = builder()
    const distance = distanceFromTarget(candidate.text.length, target)

    if (distance < bestDistance) {
      best = candidate
      bestDistance = distance
    }

    if (distance === 0) {
      return candidate
    }
  }

  const fallback = best ?? builder()

  return {
    ...fallback,
    debugNotes: [...fallback.debugNotes, `length target fallback used (${fallback.text.length})`],
  }
}

function createSynthesisContext(input: SynthesisInput): SynthesisContext {
  const keyPosition = findKeyPosition(input.reading)
  const past = findPosition(input.reading.positions, '過去') ?? keyPosition
  const now = findPosition(input.reading.positions, '現在') ?? keyPosition
  const future = findPosition(input.reading.positions, '未来') ?? keyPosition
  const method = findPosition(input.reading.positions, '手段') ?? keyPosition
  const mindset = findPosition(input.reading.positions, 'マインドセット') ?? keyPosition
  const fortune = findPosition(input.reading.positions, '全体運勢') ?? keyPosition
  const baseTone = mapTone(input.reading.input.readingMode)
  const dominantPosition = getDominantPosition(input.reading)
  const tone = dominantPosition === 'reversed' ? 'hushed' : baseTone
  const recipient = getRecipientLabel(input.reading.input.nickname)

  return {
    reading: input.reading,
    length: input.length,
    rng: input.rng,
    tone,
    dominantPosition,
    recipient,
    keyPosition,
    past,
    now,
    future,
    method,
    mindset,
    fortune,
    placeholders: {
      recipient,
      intent: input.reading.input.intent,
      timeframe: input.reading.input.timeframe,
      keyCardName: keyPosition.cardName,
      cardName: keyPosition.cardName,
      pastCardName: past.cardName,
      nowCardName: now.cardName,
      futureCardName: future.cardName,
      methodCardName: method.cardName,
      mindsetCardName: mindset.cardName,
      fortuneCardName: fortune.cardName,
      pairFocus: input.reading.pairFocus[0] ?? '',
    },
    cardNames: [
      keyPosition.cardName,
      past.cardName,
      now.cardName,
      future.cardName,
      method.cardName,
      mindset.cardName,
      fortune.cardName,
    ],
  }
}

function createBuildState(rng: () => number): BuildState {
  return {
    rng,
    usedFragmentIds: new Set<string>(),
    usedSentences: new Set<string>(),
    usedCardCounts: new Map<string, number>(),
    previousEndingType: null,
    debugNotes: [],
    debugTrace: [],
  }
}

function pickSlotText(
  slot: SynthesisSlot,
  context: SynthesisContext,
  state: BuildState,
  options: SlotPickOptions = {},
): string {
  const basePool = resolveFragmentPool(slot, context, state.usedFragmentIds)
  const guardedPool = applyEndingGuard(basePool, state.previousEndingType, options.guardEndingType)
  const pool = guardedPool.length > 0 ? guardedPool : basePool
  const workingPool = [...pool]

  while (workingPool.length > 0) {
    const pickedIndex = Math.floor(state.rng() * workingPool.length)
    const [fragment] = workingPool.splice(pickedIndex, 1)
    const rendered = finalizeInline(
      renderPlaceholders(fragment.text, {
        ...context.placeholders,
        ...options.placeholders,
      }),
      context.reading,
    )

    if (!canUseRenderedFragment(rendered, context, state)) {
      continue
    }

    commitRenderedFragment(
      fragment,
      rendered,
      context,
      state,
      slot,
      options.debugSection ?? slot,
    )
    return rendered
  }

  const fallback = basePool[0]

  if (!fallback) {
    state.debugNotes.push(`no fragment found for slot ${slot}`)
    return ''
  }

  const rendered = finalizeInline(
    renderPlaceholders(fallback.text, {
      ...context.placeholders,
      ...options.placeholders,
    }),
    context.reading,
  )

  commitRenderedFragment(
    fallback,
    rendered,
    context,
    state,
    slot,
    options.debugSection ?? slot,
  )
  state.debugNotes.push(`fallback fragment reuse for ${slot}`)

  return rendered
}

function pickPositionSentence(
  position: ReadingPositionResult,
  length: ReadingLength,
  prefer: PickSentencesOptions['prefer'],
  state: BuildState,
  debugSection: string,
): string {
  const candidatePool = pickSentences(position.generated[length], {
    count: 3,
    prefer,
    avoid: [...state.usedSentences],
  })
  const fallbackPool = candidatePool.length > 0
    ? candidatePool
    : pickSentences(position.generated[length], {
      count: 3,
      avoid: [...state.usedSentences],
      minChars: 8,
      maxChars: 120,
    })
  const picked = fallbackPool.length > 0
    ? fallbackPool[Math.floor(state.rng() * fallbackPool.length)]
    : stripTrailingPunctuation(position.generated[length].body)

  state.usedSentences.add(picked)
  state.debugTrace.push({
    section: debugSection,
    kind: 'positionSentence',
    text: picked,
    positionLabel: position.label,
    cardName: position.cardName,
    readingLength: length,
    prefer: prefer ?? undefined,
  })

  return picked
}

function pickPositionSnippet(
  position: ReadingPositionResult,
  lengths: ReadingLength[],
  prefer: PickSentencesOptions['prefer'],
  state: BuildState,
  maxChars: number,
  debugSection: string,
) {
  const length = lengths[Math.floor(state.rng() * lengths.length)] ?? lengths[0] ?? 'medium'
  const sentence = pickPositionSentence(position, length, prefer, state, debugSection)
  return condenseText(sentence, maxChars)
}

function renderPlaceholders(text: string, placeholders: RenderPlaceholderMap): string {
  let next = text
  const recipient = placeholders.recipient?.trim() ?? ''

  if (!recipient) {
    next = next
      .replace(/\{recipient\}\s*自身/g, '自分自身')
      .replace(/\{recipient\}\s*側/g, '自分側')
      .replace(/\{recipient\}へ/g, '')
      .replace(/\{recipient\}の/g, '')
  }

  next = next.replace(/\{([a-zA-Z0-9]+)\}/g, (_, rawKey: string) => {
    const key = rawKey as RenderPlaceholderKey

    if (Object.prototype.hasOwnProperty.call(placeholders, key)) {
      return placeholders[key] ?? ''
    }

    if (import.meta.env.DEV && !warnedUnknownPlaceholders.has(rawKey)) {
      warnedUnknownPlaceholders.add(rawKey)
      console.warn(`[synthesis] unknown placeholder: ${rawKey}`)
    }

    return ''
  })

  return normalizeJapaneseText(next)
}

function normalizeJapaneseText(text: string): string {
  let next = text
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([、。！？」』）])/g, '$1')
    .replace(/([「『（])\s+/g, '$1')
    .replace(/、{2,}/g, '、')
    .replace(/。{2,}/g, '。')
    .replace(/\s*、\s*/g, '、')
    .replace(/\s*。\s*/g, '。')
    .replace(/はは/g, 'は')
    .replace(/をを/g, 'を')
    .replace(/にに/g, 'に')
    .replace(/のの/g, 'の')
    .trim()

  for (const adverb of repeatedAdverbs) {
    const escaped = escapeRegExp(adverb)
    next = next.replace(new RegExp(`(${escaped})\\s*\\1`, 'g'), '$1')
  }

  next = next
    .replace(/、。/g, '。')
    .replace(/。。+/g, '。')
    .replace(/、、+/g, '、')
    .replace(/\s+$/g, '')

  return next
}

function finalizeParagraph(parts: string[], reading: ReadingResult): string {
  const normalizedParts = parts
    .map((part) => ensureSentence(part))
    .filter(Boolean)

  return sanitizeReadingText(normalizeJapaneseText(normalizedParts.join('')), reading)
}

function finalizeInline(text: string, reading: ReadingResult): string {
  return sanitizeReadingText(normalizeJapaneseText(stripTrailingPunctuation(text)), reading)
}

function ensureSentence(text: string): string {
  const trimmed = normalizeJapaneseText(text)

  if (!trimmed) {
    return ''
  }

  if (/[。！？]$/.test(trimmed)) {
    return trimmed
  }

  return `${trimmed}。`
}

function stripTrailingPunctuation(text: string): string {
  return text.trim().replace(/[。！？]+$/g, '')
}

export function condenseText(text: string, maxChars: number) {
  const trimmed = stripTrailingPunctuation(text).trim()

  if (trimmed.length <= maxChars) {
    return trimmed
  }

  const sliced = trimmed.slice(0, maxChars)
  const lastBreak = Math.max(
    sliced.lastIndexOf('、'),
    sliced.lastIndexOf('・'),
    sliced.lastIndexOf('。'),
  )

  if (maxChars >= 8 && maxChars <= 12 && lastBreak >= Math.floor(maxChars / 2)) {
    return sliced.slice(0, lastBreak).trim()
  }

  return `${sliced.slice(0, Math.max(1, maxChars - 1)).trim()}…`
}

function scoreSentence(
  sentence: string,
  reading: TarotReading,
  roleHints: string[],
  avoid: ReadonlyArray<string>,
): number {
  let score = 0

  if (roleHints.some((hint) => sentence.includes(hint))) {
    score += 3
  }

  if (reading.keywords.some((keyword) => keyword && sentence.includes(keyword))) {
    score += 2
  }

  if (avoid.includes(sentence)) {
    score -= 5
  }

  if (avoid.some((entry) => entry.slice(0, 4) === sentence.slice(0, 4))) {
    score -= 2
  }

  return score
}

function splitIntoSentences(text: string): string[] {
  return text
    .split(/[。！？]/)
    .map((segment) => segment.trim())
    .filter(Boolean)
}

function mapTone(mode: EngineReadingInput['readingMode']): Tone {
  return mode === 'quick' ? 'tender' : 'oracular'
}

function getDominantPosition(reading: ReadingResult): Position {
  const reversedCount = reading.positions.filter((position) => position.reversed).length
  return reversedCount >= reading.positions.length / 2 ? 'reversed' : 'upright'
}

function findPosition(
  positions: ReadingPositionResult[],
  label: string,
): ReadingPositionResult | undefined {
  return positions.find((position) => position.label === label)
}

function findKeyPosition(reading: ReadingResult): ReadingPositionResult {
  return reading.positions.find((position) => position.cardNo === reading.keyCardNo)
    ?? reading.positions[0]
}

function applyEndingGuard(
  pool: SynthesisFragment[],
  previousEndingType: EndingType | null,
  guardEndingType = false,
): SynthesisFragment[] {
  if (!guardEndingType || !previousEndingType) {
    return pool
  }

  const filtered = pool.filter(
    (fragment) => detectEndingType(fragment.text) !== previousEndingType,
  )

  return filtered.length > 0 ? filtered : pool
}

function canUseRenderedFragment(
  rendered: string,
  context: SynthesisContext,
  state: BuildState,
): boolean {
  const mentions = countMentionedCards(rendered, context.cardNames)

  for (const [cardName, count] of mentions.entries()) {
    if (cardName === context.keyPosition.cardName) {
      continue
    }

    const current = state.usedCardCounts.get(cardName) ?? 0
    if (current + count > 3) {
      return false
    }
  }

  return true
}

function commitRenderedFragment(
  fragment: SynthesisFragment,
  rendered: string,
  context: SynthesisContext,
  state: BuildState,
  slot: SynthesisSlot,
  section: string,
) {
  state.usedFragmentIds.add(fragment.id)
  state.previousEndingType = detectEndingType(rendered)
  state.debugTrace.push({
    section,
    kind: 'fragment',
    text: rendered,
    slot,
    fragmentId: fragment.id,
  })

  const mentions = countMentionedCards(rendered, context.cardNames)
  for (const [cardName, count] of mentions.entries()) {
    state.usedCardCounts.set(cardName, (state.usedCardCounts.get(cardName) ?? 0) + count)
  }
}

function countMentionedCards(text: string, cardNames: string[]) {
  const counts = new Map<string, number>()

  for (const cardName of cardNames) {
    const matches = text.match(new RegExp(escapeRegExp(cardName), 'g'))
    const count = matches?.length ?? 0
    if (count > 0) {
      counts.set(cardName, count)
    }
  }

  return counts
}

function distanceFromTarget(length: number, target: LengthTarget) {
  if (length >= target.min && length <= target.max) {
    return 0
  }

  return Math.abs(length - target.target)
}

function scoreSnapshot(snapshot: BuiltSynthesisSnapshot) {
  const entries: Array<[string, LengthTarget]> = [
    [snapshot.headline, snapshotTargets.headline],
    [snapshot.focus, snapshotTargets.focus],
    [snapshot.nextStep, snapshotTargets.nextStep],
    [snapshot.caution, snapshotTargets.caution],
    [snapshot.historyLine, snapshotTargets.historyLine],
  ]

  return entries.reduce((total, [text, target]) => total + distanceFromTarget(text.length, target), 0)
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
