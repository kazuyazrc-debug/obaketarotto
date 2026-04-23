import type { Reading, ReadingSnapshot } from './types'

const STORAGE_KEY = 'obake-tarot-generator-history-v1'
const MAX_HISTORY = 30

function canUseSessionStorage() {
  return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined'
}

export function buildReadingHistorySnapshot(reading: Reading): ReadingSnapshot {
  return {
    card: reading.card,
    position: reading.position,
    selectedFragmentIds: reading.selectedFragmentIds,
    templateId: reading.templateId,
    openerId: reading.openerId,
    closingId: reading.closingId,
    cadenceId: reading.cadenceId,
    tailSentence: reading.tailSentence,
    keywords: reading.keywords,
  }
}

export function readReadingHistory(): ReadingSnapshot[] {
  if (!canUseSessionStorage()) {
    return []
  }

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw) as ReadingSnapshot[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function writeReadingHistory(history: ReadonlyArray<ReadingSnapshot>) {
  if (!canUseSessionStorage()) {
    return
  }

  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)))
}

export function appendReadingHistory(
  currentHistory: ReadonlyArray<ReadingSnapshot>,
  snapshots: ReadonlyArray<ReadingSnapshot>,
) {
  const nextHistory = [...snapshots, ...currentHistory].slice(0, MAX_HISTORY)
  writeReadingHistory(nextHistory)
  return nextHistory
}

export function clearReadingHistory() {
  if (!canUseSessionStorage()) {
    return
  }

  window.sessionStorage.removeItem(STORAGE_KEY)
}
