export type Topic = 'love' | 'work' | 'money' | 'relationship' | 'self'
export type Tone = 'hushed' | 'oracular' | 'tender'
export type Length = 'short' | 'medium' | 'long'
export type Position = 'upright' | 'reversed'

export type ReadingInput = {
  cardId: string
  topic: Topic
  tone: Tone
  length: Length
  position: Position
}

export type FragmentKind = 'opener' | 'state' | 'hidden' | 'warning' | 'advice' | 'closing'
export type SemanticBias = 'light' | 'shadow' | 'neutral'
export type SegmentEnergy = 'active' | 'passive' | 'balanced'
export type AdviceMode = 'act' | 'release' | 'wait' | 'observe'

export type FragmentDefinition = {
  id: string
  kind: FragmentKind
  text: string
  bias: SemanticBias
  tones?: Tone[]
  topics?: Topic[]
  position?: Position | 'any'
  energy?: SegmentEnergy
  adviceMode?: AdviceMode
  keywords?: string[]
  tags?: string[]
}

export type StructuredCardData = {
  id: string
  displayName: string
  coreTheme: string[]
  lightMeaning: string[]
  shadowMeaning: string[]
  emotions: string[]
  warnings: string[]
  actions: Record<Topic, string[]>
  scene: string[]
  omen: string[]
  shift: string[]
  shadowShift: string[]
  comfort: string[]
  release: string[]
  lineFragments: {
    opener: FragmentDefinition[]
    state: FragmentDefinition[]
    hidden: FragmentDefinition[]
    advice: FragmentDefinition[]
    closing: FragmentDefinition[]
  }
  warningFragments: FragmentDefinition[]
}

export type TemplatePartName =
  | 'opener'
  | 'state'
  | 'hidden'
  | 'warning'
  | 'advice'
  | 'closing'

export type TemplateDefinition = {
  id: string
  length: Length
  tones: Tone[]
  parts: TemplatePartName[]
  format: (parts: Record<TemplatePartName, string>) => string
}

export type ReadingDebug = {
  cardDisplayName: string
  effectiveTone: Tone
  openerId: string
  stateId: string
  hiddenId?: string
  warningId?: string
  adviceId: string
  closingId: string
  openerBias: SemanticBias
  stateBias: SemanticBias
  warningBias?: SemanticBias
  adviceMode?: AdviceMode
  adviceEnergy?: SegmentEnergy
  closingEnergy?: SegmentEnergy
  keywords: string[]
  retryCount: number
  usedTemplateId: string
  cadenceId: string
  tailSentence: string
}

export type Reading = {
  body: string
  card: string
  position: Position
  selectedFragmentIds: string[]
  templateId: string
  tone: Tone
  length: Length
  topic: Topic
  keywords: string[]
  openerId: string
  closingId: string
  cadenceId: string
  tailSentence: string
  debug: ReadingDebug
}

export type ReadingSnapshot = Pick<
  Reading,
  'selectedFragmentIds' | 'templateId' | 'card' | 'position'
> & {
  openerId: string
  closingId: string
  cadenceId?: string
  tailSentence?: string
  keywords: string[]
}

export type ValidationResult = {
  ok: boolean
  reason?: string
}

export type LegacyCardSeed = {
  id: string
  displayName: string
  coreTheme: string[]
  lightMeaning: string[]
  shadowMeaning: string[]
  emotions: string[]
  warnings: string[]
  actions: Record<Topic, string[]>
}
