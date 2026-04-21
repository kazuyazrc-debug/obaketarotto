import type {
  Length,
  TemplateDefinition,
  TemplatePartName,
  Tone,
} from './types'

type TemplateFactory = {
  id: string
  length: Length
  tones: Tone[]
  parts: TemplatePartName[]
  sentences: TemplatePartName[]
  bridge?: string
}

function sentence(
  values: Record<TemplatePartName, string>,
  part: TemplatePartName,
) {
  return values[part].trim()
}

function createTemplate(config: TemplateFactory): TemplateDefinition {
  return {
    id: config.id,
    length: config.length,
    tones: config.tones,
    parts: config.parts,
    format(parts) {
      const rendered = config.sentences.map((part) => sentence(parts, part)).filter(Boolean)
      if (rendered.length === 0) {
        return ''
      }

      if (!config.bridge || rendered.length < 2) {
        return `${rendered.join('。')}。`
      }

      const [first, second, ...rest] = rendered
      return `${first}。${config.bridge}${second}。${rest.join('。')}${rest.length > 0 ? '。' : ''}`
    },
  }
}

export const templates: TemplateDefinition[] = [
  createTemplate({
    id: 'tpl-short-hushed-1',
    length: 'short',
    tones: ['hushed'],
    parts: ['opener', 'state', 'advice', 'closing'],
    sentences: ['opener', 'state', 'advice', 'closing'],
  }),
  createTemplate({
    id: 'tpl-short-hushed-2',
    length: 'short',
    tones: ['hushed'],
    parts: ['opener', 'state', 'advice', 'closing'],
    sentences: ['opener', 'state', 'closing', 'advice'],
  }),
  createTemplate({
    id: 'tpl-short-hushed-3',
    length: 'short',
    tones: ['hushed'],
    parts: ['opener', 'state', 'advice', 'closing'],
    sentences: ['opener', 'advice', 'state', 'closing'],
  }),
  createTemplate({
    id: 'tpl-short-hushed-4',
    length: 'short',
    tones: ['hushed'],
    parts: ['opener', 'state', 'advice', 'closing'],
    sentences: ['state', 'opener', 'advice', 'closing'],
  }),
  createTemplate({
    id: 'tpl-short-oracular-1',
    length: 'short',
    tones: ['oracular'],
    parts: ['opener', 'state', 'advice', 'closing'],
    sentences: ['opener', 'state', 'advice', 'closing'],
    bridge: 'そして、',
  }),
  createTemplate({
    id: 'tpl-short-oracular-2',
    length: 'short',
    tones: ['oracular'],
    parts: ['opener', 'state', 'advice', 'closing'],
    sentences: ['opener', 'advice', 'state', 'closing'],
  }),
  createTemplate({
    id: 'tpl-short-oracular-3',
    length: 'short',
    tones: ['oracular'],
    parts: ['opener', 'state', 'advice', 'closing'],
    sentences: ['state', 'opener', 'advice', 'closing'],
  }),
  createTemplate({
    id: 'tpl-short-tender-1',
    length: 'short',
    tones: ['tender'],
    parts: ['opener', 'state', 'advice', 'closing'],
    sentences: ['opener', 'state', 'closing', 'advice'],
  }),
  createTemplate({
    id: 'tpl-short-tender-2',
    length: 'short',
    tones: ['tender'],
    parts: ['opener', 'state', 'advice', 'closing'],
    sentences: ['opener', 'advice', 'state', 'closing'],
  }),
  createTemplate({
    id: 'tpl-short-tender-3',
    length: 'short',
    tones: ['tender'],
    parts: ['opener', 'state', 'advice', 'closing'],
    sentences: ['state', 'opener', 'closing', 'advice'],
  }),
  createTemplate({
    id: 'tpl-medium-hushed-1',
    length: 'medium',
    tones: ['hushed'],
    parts: ['opener', 'state', 'hidden', 'advice', 'closing'],
    sentences: ['opener', 'state', 'hidden', 'advice', 'closing'],
  }),
  createTemplate({
    id: 'tpl-medium-hushed-2',
    length: 'medium',
    tones: ['hushed'],
    parts: ['opener', 'state', 'hidden', 'advice', 'closing'],
    sentences: ['opener', 'hidden', 'state', 'advice', 'closing'],
  }),
  createTemplate({
    id: 'tpl-medium-oracular-1',
    length: 'medium',
    tones: ['oracular'],
    parts: ['opener', 'state', 'hidden', 'advice', 'closing'],
    sentences: ['opener', 'state', 'advice', 'hidden', 'closing'],
    bridge: 'そのうえで、',
  }),
  createTemplate({
    id: 'tpl-medium-oracular-2',
    length: 'medium',
    tones: ['oracular'],
    parts: ['opener', 'state', 'hidden', 'advice', 'closing'],
    sentences: ['opener', 'hidden', 'state', 'advice', 'closing'],
  }),
  createTemplate({
    id: 'tpl-medium-tender-1',
    length: 'medium',
    tones: ['tender'],
    parts: ['opener', 'state', 'hidden', 'advice', 'closing'],
    sentences: ['opener', 'state', 'hidden', 'closing', 'advice'],
  }),
  createTemplate({
    id: 'tpl-medium-tender-2',
    length: 'medium',
    tones: ['tender'],
    parts: ['opener', 'state', 'hidden', 'advice', 'closing'],
    sentences: ['opener', 'hidden', 'state', 'closing', 'advice'],
  }),
  createTemplate({
    id: 'tpl-long-hushed-1',
    length: 'long',
    tones: ['hushed'],
    parts: ['opener', 'state', 'hidden', 'warning', 'advice', 'closing'],
    sentences: ['opener', 'state', 'hidden', 'warning', 'advice', 'closing'],
  }),
  createTemplate({
    id: 'tpl-long-hushed-2',
    length: 'long',
    tones: ['hushed'],
    parts: ['opener', 'state', 'hidden', 'warning', 'advice', 'closing'],
    sentences: ['opener', 'hidden', 'state', 'warning', 'advice', 'closing'],
  }),
  createTemplate({
    id: 'tpl-long-oracular-1',
    length: 'long',
    tones: ['oracular'],
    parts: ['opener', 'state', 'hidden', 'warning', 'advice', 'closing'],
    sentences: ['opener', 'state', 'hidden', 'advice', 'warning', 'closing'],
    bridge: 'さらに、',
  }),
  createTemplate({
    id: 'tpl-long-oracular-2',
    length: 'long',
    tones: ['oracular'],
    parts: ['opener', 'state', 'hidden', 'warning', 'advice', 'closing'],
    sentences: ['opener', 'hidden', 'state', 'warning', 'advice', 'closing'],
  }),
  createTemplate({
    id: 'tpl-long-tender-1',
    length: 'long',
    tones: ['tender'],
    parts: ['opener', 'state', 'hidden', 'warning', 'advice', 'closing'],
    sentences: ['opener', 'state', 'hidden', 'warning', 'closing', 'advice'],
  }),
  createTemplate({
    id: 'tpl-long-tender-2',
    length: 'long',
    tones: ['tender'],
    parts: ['opener', 'state', 'hidden', 'warning', 'advice', 'closing'],
    sentences: ['opener', 'hidden', 'state', 'warning', 'closing', 'advice'],
  }),
]
