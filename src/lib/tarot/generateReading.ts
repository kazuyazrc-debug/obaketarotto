import { getStructuredCard } from './cards'
import { filterByPosition } from './fragments'
import { templates } from './templates'
import { validateReading } from './validate'
import type {
  FragmentDefinition,
  Position,
  Reading,
  ReadingInput,
  ReadingSnapshot,
  SemanticBias,
  StructuredCardData,
  TemplateDefinition,
  Tone,
} from './types'

type GenerateReadingDeps = {
  rng: () => number
  history: ReadonlyArray<ReadingSnapshot>
}

type GenerationCandidate = {
  reading: Reading
  score: number
}

type KeywordContext = {
  recentCounts: Map<string, number>
  current: string[]
}

type CadenceDefinition = {
  id: string
  tone: Tone
  position: Position
  length: ReadingInput['length']
  text: string
}

type TemplateVariant = {
  template: TemplateDefinition
  cadence: { id: string; text: string }
  templateId: string
}

const TARGET_LENGTHS = {
  short: { min: 64, max: 96 },
  medium: { min: 128, max: 192 },
  long: { min: 224, max: 336 },
} as const

const cadences: CadenceDefinition[] = [
  { id: 'cadence-short-hushed-up-1', tone: 'hushed', position: 'upright', length: 'short', text: '輪郭はもう戻り始めています。' },
  { id: 'cadence-short-hushed-up-2', tone: 'hushed', position: 'upright', length: 'short', text: '静けさはすでに味方です。' },
  { id: 'cadence-short-hushed-up-3', tone: 'hushed', position: 'upright', length: 'short', text: '小さな光は消えていません。' },
  { id: 'cadence-short-hushed-up-4', tone: 'hushed', position: 'upright', length: 'short', text: '月明かりはまだ届いています。' },
  { id: 'cadence-short-hushed-up-5', tone: 'hushed', position: 'upright', length: 'short', text: '今夜は静かな前進が似合います。' },
  { id: 'cadence-short-hushed-up-6', tone: 'hushed', position: 'upright', length: 'short', text: '急がなくても流れは動きます。' },
  { id: 'cadence-short-hushed-up-7', tone: 'hushed', position: 'upright', length: 'short', text: '細い光ほど長く残ります。' },
  { id: 'cadence-short-hushed-up-8', tone: 'hushed', position: 'upright', length: 'short', text: '今夜は輪郭を守る夜です。' },
  { id: 'cadence-short-hushed-rev-1', tone: 'hushed', position: 'reversed', length: 'short', text: 'ほどく順番から整えていきましょう。' },
  { id: 'cadence-short-hushed-rev-2', tone: 'hushed', position: 'reversed', length: 'short', text: '揺れを小さく扱うほど戻せます。' },
  { id: 'cadence-medium-hushed-up-1', tone: 'hushed', position: 'upright', length: 'medium', text: '境目を急がず越えるほど読みは澄みます。' },
  { id: 'cadence-medium-hushed-up-2', tone: 'hushed', position: 'upright', length: 'medium', text: 'ろうそくの火を見るように一つずつ整える夜です。' },
  { id: 'cadence-medium-hushed-rev-1', tone: 'hushed', position: 'reversed', length: 'medium', text: '今夜は結論より、重さを減らす順番を大切にしたいところです。' },
  { id: 'cadence-medium-oracular-up-1', tone: 'oracular', position: 'upright', length: 'medium', text: '見えてきた輪郭を、現実の一歩へ静かに移す時です。' },
  { id: 'cadence-medium-oracular-up-2', tone: 'oracular', position: 'upright', length: 'medium', text: '札は、境目に触れる勇気が流れを変えると告げています。' },
  { id: 'cadence-medium-oracular-rev-1', tone: 'oracular', position: 'reversed', length: 'medium', text: '逆位置の夜ほど、待つこと自体が選択の一部になります。' },
  { id: 'cadence-medium-tender-up-1', tone: 'tender', position: 'upright', length: 'medium', text: 'こわさが残っても、やさしい一歩なら十分に意味があります。' },
  { id: 'cadence-medium-tender-rev-1', tone: 'tender', position: 'reversed', length: 'medium', text: '今夜は自分を急がせないことが、そのまま支えになります。' },
  { id: 'cadence-long-hushed-up-1', tone: 'hushed', position: 'upright', length: 'long', text: '夜気の薄い震えまで拾うつもりで進めると、この札の示唆は現実によく馴染みます。' },
  { id: 'cadence-long-hushed-rev-1', tone: 'hushed', position: 'reversed', length: 'long', text: '逆位置の長い読みでは、急がず整えることそのものが次章の土台になります。' },
  { id: 'cadence-long-oracular-up-1', tone: 'oracular', position: 'upright', length: 'long', text: '札の示す門はもう半分ひらいていて、残る半歩はあなたの選び方に託されています。' },
  { id: 'cadence-long-oracular-rev-1', tone: 'oracular', position: 'reversed', length: 'long', text: '逆位置でも門が閉じるわけではなく、順番を誤らないことが通路を守ります。' },
  { id: 'cadence-long-tender-up-1', tone: 'tender', position: 'upright', length: 'long', text: 'やわらかな手つきで整えるほど、この読みは怖さより支えとして働いてくれます。' },
  { id: 'cadence-long-tender-rev-1', tone: 'tender', position: 'reversed', length: 'long', text: '今夜は立て直しを急がず、自分の揺れを抱えたまま歩幅を小さくするのがやさしい道です。' },
]

const toneShift: Record<Tone, Tone> = {
  tender: 'hushed',
  oracular: 'hushed',
  hushed: 'hushed',
}

export function generateReading(
  input: ReadingInput,
  deps: GenerateReadingDeps,
): Reading {
  const card = getStructuredCard(input.cardId)

  if (!card) {
    throw new Error(`Structured card ${input.cardId} not found`)
  }

  return generateReadingFromCardData(card, input, deps)
}

export function generateReadingFromCardData(
  card: StructuredCardData,
  input: ReadingInput,
  deps: GenerateReadingDeps,
): Reading {
  const attempts: GenerationCandidate[] = []

  for (let retryCount = 0; retryCount < 3; retryCount += 1) {
    const candidate = buildCandidate(card, input, deps, retryCount)
    const validation = validateReading(candidate.reading)

    if (validation.ok) {
      return candidate.reading
    }

    attempts.push({
      reading: candidate.reading,
      score: candidate.score - 10,
    })
  }

  return attempts.sort((left, right) => right.score - left.score)[0]?.reading ?? buildFallback(card, input)
}

function buildCandidate(
  card: StructuredCardData,
  input: ReadingInput,
  deps: GenerateReadingDeps,
  retryCount: number,
): GenerationCandidate {
  const effectiveTone = input.position === 'reversed' ? toneShift[input.tone] : input.tone
  const recentFive = deps.history.slice(0, 5)
  const recentTen = deps.history.slice(0, 10)
  const forbiddenTemplates = new Set(recentFive.map((snapshot) => snapshot.templateId))
  const forbiddenOpeners = new Set(recentFive.map((snapshot) => snapshot.openerId))
  const forbiddenClosings = new Set(recentFive.map((snapshot) => snapshot.closingId))
  const keywordContext: KeywordContext = {
    recentCounts: countKeywords(recentTen),
    current: [],
  }

  const templateVariant = pickTemplateVariant(
    input.length,
    effectiveTone,
    input.position,
    deps.rng,
    forbiddenTemplates,
  )
  const opener = pickFragment({
    fragments: card.lineFragments.opener,
    rng: deps.rng,
    effectiveTone,
    position: input.position,
    forbiddenIds: forbiddenOpeners,
    preferredBias: input.position === 'reversed' ? 'shadow' : 'light',
  })
  const state = pickFragment({
    fragments: card.lineFragments.state,
    rng: deps.rng,
    effectiveTone,
    position: input.position,
    preferredBias: input.position === 'reversed' ? 'shadow' : 'light',
  })
  const hidden =
    input.length === 'medium' || input.length === 'long'
      ? pickFragment({
          fragments: card.lineFragments.hidden,
          rng: deps.rng,
          effectiveTone,
          position: input.position,
        })
      : null
  const warning =
    input.length === 'long'
      ? pickFragment({
          fragments: card.warningFragments,
          rng: deps.rng,
          effectiveTone,
          position: input.position,
          preferredBias: input.position === 'reversed' ? 'shadow' : 'neutral',
        })
      : null
  const advice = pickFragment({
    fragments: card.lineFragments.advice,
    rng: deps.rng,
    effectiveTone,
    position: input.position,
    preferredBias: input.position === 'reversed' ? 'shadow' : 'light',
    topic: input.topic,
  })
  const closing = pickFragment({
    fragments: card.lineFragments.closing,
    rng: deps.rng,
    effectiveTone,
    position: input.position,
    forbiddenIds: forbiddenClosings,
    preferredBias: input.position === 'reversed' ? 'shadow' : 'light',
  })

  const renderedParts = {
    opener: renderFragment(opener, card, input, deps.rng, keywordContext),
    state: renderFragment(state, card, input, deps.rng, keywordContext),
    hidden: hidden ? renderFragment(hidden, card, input, deps.rng, keywordContext) : '',
    warning: warning ? renderFragment(warning, card, input, deps.rng, keywordContext) : '',
    advice: renderFragment(advice, card, input, deps.rng, keywordContext),
    closing: renderFragment(closing, card, input, deps.rng, keywordContext),
  }
  const body = normalizeJapaneseText(
    `${templateVariant.template.format(renderedParts)} ${templateVariant.cadence.text}`,
  )
  const selectedFragmentIds = [opener.id, state.id]
  if (hidden) {
    selectedFragmentIds.push(hidden.id)
  }
  if (warning) {
    selectedFragmentIds.push(warning.id)
  }
  selectedFragmentIds.push(advice.id, closing.id, templateVariant.cadence.id)

  const reading: Reading = {
    body,
    card: card.id,
    position: input.position,
    selectedFragmentIds,
    templateId: templateVariant.templateId,
    tone: input.tone,
    length: input.length,
    topic: input.topic,
    keywords: keywordContext.current,
    openerId: opener.id,
    closingId: closing.id,
    debug: {
      cardDisplayName: card.displayName,
      effectiveTone,
      openerId: opener.id,
      stateId: state.id,
      hiddenId: hidden?.id,
      warningId: warning?.id,
      adviceId: advice.id,
      closingId: closing.id,
      openerBias: opener.bias,
      stateBias: state.bias,
      warningBias: warning?.bias,
      adviceMode: advice.adviceMode,
      adviceEnergy: advice.energy,
      closingEnergy: closing.energy,
      keywords: keywordContext.current,
      retryCount,
      usedTemplateId: templateVariant.templateId,
    },
  }

  const score = scoreReading(reading, deps.history)
  return { reading, score }
}

function buildFallback(card: StructuredCardData, input: ReadingInput): Reading {
  const body = normalizeJapaneseText(
    `${card.displayName}は${card.coreTheme[0]}を照らします。いまは${card.lightMeaning[0]}を意識しつつ、${card.actions[input.topic][0]}ところから静かに整えるとよいでしょう。`,
  )

  return {
    body,
    card: card.id,
    position: input.position,
    selectedFragmentIds: ['fallback-opener', 'fallback-state', 'fallback-advice', 'fallback-closing'],
    templateId: 'fallback-template',
    tone: input.tone,
    length: input.length,
    topic: input.topic,
    keywords: [card.coreTheme[0], card.emotions[0]],
    openerId: 'fallback-opener',
    closingId: 'fallback-closing',
    debug: {
      cardDisplayName: card.displayName,
      effectiveTone: input.position === 'reversed' ? toneShift[input.tone] : input.tone,
      openerId: 'fallback-opener',
      stateId: 'fallback-state',
      adviceId: 'fallback-advice',
      closingId: 'fallback-closing',
      openerBias: 'neutral',
      stateBias: 'light',
      adviceMode: 'observe',
      adviceEnergy: 'balanced',
      closingEnergy: 'balanced',
      keywords: [card.coreTheme[0], card.emotions[0]],
      retryCount: 3,
      usedTemplateId: 'fallback-template',
    },
  }
}

function pickTemplateVariant(
  length: ReadingInput['length'],
  tone: Tone,
  position: Position,
  rng: () => number,
  forbiddenTemplateIds: ReadonlySet<string>,
) {
  const templatePool = templates.filter(
    (template) => template.length === length && template.tones.includes(tone),
  )
  const cadencePool = pickCadencePool(tone, position, length)
  const combinations: TemplateVariant[] = []

  for (const template of templatePool) {
    for (const cadence of cadencePool) {
      combinations.push({
        template,
        cadence,
        templateId: `${template.id}::${cadence.id}`,
      })
    }
  }

  const cleanPool = combinations.filter(
    (variant) => !forbiddenTemplateIds.has(variant.templateId),
  )

  return pickOne(cleanPool.length > 0 ? cleanPool : combinations, rng)
}

function pickFragment(config: {
  fragments: FragmentDefinition[]
  rng: () => number
  effectiveTone: Tone
  position: Position
  forbiddenIds?: ReadonlySet<string>
  preferredBias?: SemanticBias
  topic?: ReadingInput['topic']
}) {
  const byPosition = filterByPosition(config.fragments, config.position)
  const byTone = byPosition.filter(
    (fragment) => !fragment.tones || fragment.tones.includes(config.effectiveTone),
  )
  const byTopic = byTone.filter(
    (fragment) => !fragment.topics || (config.topic ? fragment.topics.includes(config.topic) : true),
  )
  const withoutForbidden = byTopic.filter(
    (fragment) => !config.forbiddenIds || !config.forbiddenIds.has(fragment.id),
  )
  const biasedPool =
    config.preferredBias && withoutForbidden.some((fragment) => fragment.bias === config.preferredBias)
      ? withoutForbidden.filter((fragment) => fragment.bias === config.preferredBias)
      : withoutForbidden

  return pickOne(
    biasedPool.length > 0
      ? biasedPool
      : withoutForbidden.length > 0
        ? withoutForbidden
        : byTopic.length > 0
          ? byTopic
          : config.fragments,
    config.rng,
  )
}

function renderFragment(
  fragment: FragmentDefinition,
  card: StructuredCardData,
  input: ReadingInput,
  rng: () => number,
  keywordContext: KeywordContext,
) {
  const replacements = {
    displayName: card.displayName,
    theme: chooseKeyword(card.coreTheme, keywordContext, rng),
    lightMeaning: chooseKeyword(card.lightMeaning, keywordContext, rng),
    shadowMeaning: chooseKeyword(card.shadowMeaning, keywordContext, rng),
    emotion: chooseKeyword(card.emotions, keywordContext, rng),
    warning: chooseKeyword(card.warnings, keywordContext, rng),
    action: chooseKeyword(card.actions[input.topic], keywordContext, rng),
    scene: pickOne(card.scene, rng),
    omen: pickOne(card.omen, rng),
    shift: pickOne(card.shift, rng),
    shadowShift: pickOne(card.shadowShift, rng),
    comfort: pickOne(card.comfort, rng),
    release: pickOne(card.release, rng),
  }

  return fragment.text.replace(
    /\{(displayName|theme|lightMeaning|shadowMeaning|emotion|warning|action|scene|omen|shift|shadowShift|comfort|release)\}/g,
    (_, key: keyof typeof replacements) => replacements[key],
  )
}

function chooseKeyword(
  candidates: string[],
  context: KeywordContext,
  rng: () => number,
) {
  const freshPool = candidates.filter((candidate) => {
    const recentCount = context.recentCounts.get(candidate) ?? 0
    const currentCount = context.current.filter((value) => value === candidate).length
    return recentCount < 2 && currentCount === 0
  })
  const reusablePool = candidates.filter((candidate) => {
    const recentCount = context.recentCounts.get(candidate) ?? 0
    return recentCount < 2
  })
  const picked = pickOne(
    freshPool.length > 0 ? freshPool : reusablePool.length > 0 ? reusablePool : candidates,
    rng,
  )

  context.current.push(picked)
  return picked
}

function countKeywords(history: ReadonlyArray<ReadingSnapshot>) {
  const counts = new Map<string, number>()

  for (const snapshot of history) {
    for (const keyword of snapshot.keywords) {
      counts.set(keyword, (counts.get(keyword) ?? 0) + 1)
    }
  }

  return counts
}

function pickOne<T>(items: T[], rng: () => number) {
  if (items.length === 0) {
    throw new Error('Cannot pick from an empty collection')
  }

  const index = Math.min(items.length - 1, Math.floor(rng() * items.length))
  return items[index]
}

function pickCadencePool(
  tone: Tone,
  position: Position,
  length: ReadingInput['length'],
) {
  const pool = cadences.filter(
    (cadence) => cadence.tone === tone && cadence.position === position && cadence.length === length,
  )

  if (pool.length === 0) {
    return [
      {
      id: 'cadence-fallback',
      text: '',
      },
    ]
  }

  return pool
}

function scoreReading(reading: Reading, history: ReadonlyArray<ReadingSnapshot>) {
  const recentSimilarityPenalty = history
    .slice(0, 10)
    .map((snapshot) => overlapSize(snapshot.selectedFragmentIds, reading.selectedFragmentIds))
    .reduce((max, value) => Math.max(max, value), 0)

  const keywordDiversity = new Set(reading.keywords).size
  const target = TARGET_LENGTHS[reading.length]
  const lengthDistance = bodyLengthPenalty(reading.body.length, target.min, target.max)

  return keywordDiversity * 10 - recentSimilarityPenalty * 8 - lengthDistance
}

function overlapSize(left: ReadonlyArray<string>, right: ReadonlyArray<string>) {
  const rightSet = new Set(right)
  return left.filter((value) => rightSet.has(value)).length
}

function bodyLengthPenalty(length: number, min: number, max: number) {
  if (length >= min && length <= max) {
    return 0
  }

  if (length < min) {
    return min - length
  }

  return length - max
}

function normalizeJapaneseText(text: string) {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\s+([。、」』）])/g, '$1')
    .replace(/([「『（])\s+/g, '$1')
    .replace(/。+/g, '。')
    .replace(/、+/g, '、')
    .replace(/。([。])/g, '$1')
    .trim()
}
