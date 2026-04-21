import type { Reading, ValidationResult } from './types'

function includesTag(fragmentIds: string[], token: string) {
  return fragmentIds.some((id) => id.includes(token))
}

export function validateReading(reading: Reading): ValidationResult {
  const { debug, position } = reading

  if (!reading.body.trim()) {
    return { ok: false, reason: 'empty-body' }
  }

  if (position === 'upright' && debug.openerBias === 'light' && debug.warningBias === 'shadow') {
    return { ok: false, reason: 'light-opener-with-shadow-warning' }
  }

  if (
    debug.adviceEnergy === 'active' &&
    debug.closingEnergy === 'passive' &&
    position === 'upright' &&
    debug.openerBias === 'shadow'
  ) {
    return { ok: false, reason: 'active-advice-with-passive-closing' }
  }

  if (
    includesTag(reading.selectedFragmentIds, 'act-') &&
    includesTag(reading.selectedFragmentIds, 'wait-') &&
    position === 'upright'
  ) {
    return { ok: false, reason: 'conflicting-act-and-wait' }
  }

  if (
    includesTag(reading.selectedFragmentIds, 'release-') &&
    includesTag(reading.selectedFragmentIds, 'act-') &&
    position === 'reversed'
  ) {
    return { ok: false, reason: 'conflicting-release-and-act' }
  }

  const uniqueKeywords = new Set(reading.keywords)
  if (uniqueKeywords.size <= Math.max(1, Math.floor(reading.keywords.length / 2))) {
    return { ok: false, reason: 'keyword-overlap-too-high' }
  }

  return { ok: true }
}
