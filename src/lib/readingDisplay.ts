import type { ReadingResult } from './reading'

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
  if (!text || !reading) {
    return text
  }

  const recipientLabel = getRecipientLabel(reading.input.nickname)
  const recipientToken = '__RECIPIENT_LABEL__'
  const names = [...new Set(reading.positions.map((position) => position.personLabel).filter(Boolean))]
    .sort((left, right) => right.length - left.length)

  let next = recipientLabel === 'あなた'
    ? text
    : text.replace(new RegExp(escapeRegExp(recipientLabel), 'g'), recipientToken)

  for (const name of names) {
    const escaped = escapeRegExp(name)

    next = next.replace(new RegExp(`\\s*\\/\\s*${escaped}`, 'g'), '')
    next = next.replace(new RegExp(`${escaped}\\s*\\/\\s*`, 'g'), '')
    next = next.replace(new RegExp(`\\s*${escaped}\\s*の`, 'g'), '')
    next = next.replace(new RegExp(escaped, 'g'), '')
  }

  return next
    .replace(new RegExp(recipientToken, 'g'), recipientLabel)
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([。、」』）])/g, '$1')
    .replace(/([「『（])\s+/g, '$1')
    .replace(/。{2,}/g, '。')
    .replace(/、{2,}/g, '、')
    .trim()
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
