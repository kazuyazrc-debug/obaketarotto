import { tarotCharacterBackup } from '../data/tarotCharacterBackup'
import type { ReadingResult } from './reading'

const knownCharacterNames = [...new Set(tarotCharacterBackup.map((card) => card.person).filter(Boolean))]
  .sort((left, right) => right.length - left.length)

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
  const names = [...new Set([...knownCharacterNames, ...drawnNames])]
    .sort((left, right) => right.length - left.length)

  let next = recipientLabel === 'あなた'
    ? text
    : text.replace(new RegExp(escapeRegExp(recipientLabel), 'g'), recipientToken)

  for (const name of names) {
    next = stripCharacterName(next, name)
  }

  return next
    .replace(new RegExp(recipientToken, 'g'), recipientLabel)
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([。、」』）])/g, '$1')
    .replace(/([「『（])\s+/g, '$1')
    .replace(/、{2,}/g, '、')
    .replace(/。{2,}/g, '。')
    .trim()
}

function stripCharacterName(text: string, name: string) {
  const escaped = escapeRegExp(name)

  return text
    .replace(new RegExp(`${escaped}さん`, 'g'), '')
    .replace(new RegExp(`${escaped}のように`, 'g'), '')
    .replace(new RegExp(`${escaped}らしく`, 'g'), '')
    .replace(new RegExp(`${escaped}らしい`, 'g'), '')
    .replace(new RegExp(`${escaped}的`, 'g'), '')
    .replace(new RegExp(`\\s*\\/\\s*${escaped}`, 'g'), '')
    .replace(new RegExp(`${escaped}\\s*\\/\\s*`, 'g'), '')
    .replace(new RegExp(`${escaped}(の|は|が|を|に|へ|と|も|で|から|まで|より)`, 'g'), '')
    .replace(new RegExp(escaped, 'g'), '')
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
