import { describe, it } from 'vitest'
import { generateReading } from '../generateReading'
import { buildReadingHistorySnapshot } from '../history'
import type { Position, ReadingSnapshot } from '../types'

function createSeededRng(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (1664525 * state + 1013904223) >>> 0
    return state / 0x100000000
  }
}

function sampleSeries(position: Position) {
  const history: ReadingSnapshot[] = []

  for (let index = 0; index < 10; index += 1) {
    const reading = generateReading(
      {
        cardId: 'emperor',
        topic: 'work',
        tone: 'oracular',
        length: 'medium',
        position,
      },
      {
        rng: createSeededRng(5000 + index),
        history,
      },
    )

    console.log(`\n[${position}] #${index + 1}`)
    console.log(`template=${reading.templateId}`)
    console.log(`fragments=${reading.selectedFragmentIds.join(',')}`)
    console.log(reading.body)

    history.unshift(buildReadingHistorySnapshot(reading))
  }
}

describe('manual sampling', () => {
  it('prints 10 upright and 10 reversed emperor readings for review', () => {
    sampleSeries('upright')
    sampleSeries('reversed')
  })
})
