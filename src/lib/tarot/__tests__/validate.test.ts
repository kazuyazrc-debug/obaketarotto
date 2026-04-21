import { describe, expect, it } from 'vitest'
import { structuredCards } from '../cards'
import { generateReading } from '../generateReading'
import { validateReading } from '../validate'
import type { Position, Tone, Topic } from '../types'

function createSeededRng(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (1103515245 * state + 12345) >>> 0
    return state / 0x100000000
  }
}

describe('validateReading', () => {
  it('passes smoke validation for all supported cards and conditions', () => {
    const cards = structuredCards.map((card) => card.id)
    const topics: Topic[] = ['love', 'work', 'money', 'relationship', 'self']
    const tones: Tone[] = ['hushed', 'oracular', 'tender']
    const positions: Position[] = ['upright', 'reversed']

    let seed = 1

    for (const cardId of cards) {
      for (const topic of topics) {
        for (const tone of tones) {
          for (const position of positions) {
            const reading = generateReading(
              {
                cardId,
                topic,
                tone,
                length: 'medium',
                position,
              },
              {
                rng: createSeededRng(seed),
                history: [],
              },
            )

            const result = validateReading(reading)
            expect(result.ok, `${cardId}/${topic}/${tone}/${position}:${result.reason}`).toBe(true)
            seed += 1
          }
        }
      }
    }
  })
})
