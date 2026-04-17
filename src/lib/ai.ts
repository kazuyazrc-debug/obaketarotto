import type { ReadingInput, ReadingResult } from './reading'

type EnhanceResponse = {
  reading: {
    summary: ReadingResult['summary']
    totalComment: ReadingResult['totalComment']
    positions: Array<Pick<ReadingResult['positions'][number], 'short' | 'medium' | 'long'>>
  }
}

export async function enhanceReadingWithAI(
  input: ReadingInput,
  reading: ReadingResult,
) {
  const response = await fetch('/api/enhance-reading', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ input, reading }),
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'AI reading request failed')
  }

  const payload = (await response.json()) as EnhanceResponse
  return mergeEnhancedReading(reading, payload)
}

export function mergeEnhancedReading(reading: ReadingResult, payload: EnhanceResponse) {
  return {
    ...reading,
    summary: payload.reading.summary,
    totalComment: payload.reading.totalComment,
    positions: reading.positions.map((position, index) => ({
      ...position,
      ...payload.reading.positions[index],
    })),
  }
}
