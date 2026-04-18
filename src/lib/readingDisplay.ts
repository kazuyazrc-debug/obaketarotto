import { tarotCharacterBackup } from '../data/tarotCharacterBackup'
import type { ReadingResult } from './reading'

const knownCharacterNames = buildCharacterNameIndex(
  tarotCharacterBackup.map((card) => card.person).filter(Boolean),
)

export function getRecipientLabel(nickname?: string | null) {
  const trimmed = nickname?.trim()

  if (!trimmed) {
    return 'あなた'
  }

  return trimmed.endsWith('さん') ? trimmed : `${trimmed}さん`
}

export function sanitizeReadingText(
  text: string,
  reading?: ReadingResult | null,
) {
  if (!text) {
    return text
  }

  const recipientLabel = getRecipientLabel(reading?.input.nickname)
  const recipientToken = '__RECIPIENT_LABEL__'
  const drawnNames = reading
    ? reading.positions.map((position) => position.personLabel).filter(Boolean)
    : []
  const names = buildCharacterNameIndex([...knownCharacterNames, ...drawnNames])

  let next = recipientLabel === 'あなた'
    ? text
    : text.replace(new RegExp(escapeRegExp(recipientLabel), 'g'), recipientToken)

  next = sanitizeCharacterReferences(next, names)

  return next
    .replace(new RegExp(recipientToken, 'g'), recipientLabel)
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([。、」』）])/g, '$1')
    .replace(/([「『（])\s+/g, '$1')
    .replace(/、{2,}/g, '、')
    .replace(/。{2,}/g, '。')
    .trim()
}

export function sanitizeCharacterReferences(text: string, extraNames: string[] = []) {
  const names = buildCharacterNameIndex([...knownCharacterNames, ...extraNames])
  let next = text

  for (const name of names) {
    next = stripCharacterName(next, name)
  }

  return next
}

function stripCharacterName(text: string, name: string) {
  const escaped = escapeRegExp(name)

  return text
    .replace(new RegExp(`${escaped}さん`, 'g'), '')
    .replace(new RegExp(`${escaped}のように`, 'g'), '')
    .replace(new RegExp(`${escaped}らしく`, 'g'), '')
    .replace(new RegExp(`${escaped}らしい`, 'g'), '')
    .replace(new RegExp(`${escaped}らしさ`, 'g'), '')
    .replace(new RegExp(`${escaped}的`, 'g'), '')
    .replace(new RegExp(`\\s*\\/\\s*${escaped}`, 'g'), '')
    .replace(new RegExp(`${escaped}\\s*\\/\\s*`, 'g'), '')
    .replace(new RegExp(`${escaped}(の|は|が|を|に|へ|と|も|で|から|まで|より)`, 'g'), '')
    .replace(new RegExp(escaped, 'g'), '')
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function buildCharacterNameIndex(names: string[]) {
  return [...new Set(names.flatMap((name) => buildCharacterAliases(name)).filter(Boolean))]
    .sort((left, right) => right.length - left.length)
}

function buildCharacterAliases(name: string) {
  const trimmed = name.trim()
  if (!trimmed) {
    return []
  }

  const aliases = new Set<string>([trimmed])
  const kanaStart = trimmed.search(/[ぁ-んァ-ヶー]/)
  if (kanaStart > 0) {
    const suffix = trimmed.slice(kanaStart)
    if (suffix.length >= 2) {
      aliases.add(suffix)
    }
  }

  if (trimmed.includes('の')) {
    const afterNo = trimmed.split('の').pop()?.trim()
    if (afterNo && afterNo.length >= 2) {
      aliases.add(afterNo)
    }
  }

  return [...aliases]
}
