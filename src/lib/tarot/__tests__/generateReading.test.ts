import { describe, expect, it } from 'vitest'
import { generateReading } from '../generateReading'
import type { ReadingSnapshot } from '../types'

function createSeededRng(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (1664525 * state + 1013904223) >>> 0
    return state / 0x100000000
  }
}

describe('generateReading', () => {
  it('is deterministic with the same seed and input', () => {
    const input = {
      cardId: 'moon',
      topic: 'love',
      tone: 'hushed',
      length: 'medium',
      position: 'upright',
    } as const

    const first = generateReading(input, {
      rng: createSeededRng(42),
      history: [],
    })
    const second = generateReading(input, {
      rng: createSeededRng(42),
      history: [],
    })

    expect(second).toEqual(first)
  })

  it('excludes opener, closing, and template ids used in the most recent five readings', () => {
    const history: ReadingSnapshot[] = [
      {
        card: 'moon',
        position: 'upright',
        selectedFragmentIds: ['state-a', 'advice-a'],
        templateId: 'tpl-short-hushed-1',
        openerId: 'opener-shared-hushed-1',
        closingId: 'closing-shared-hushed-1',
        keywords: ['夜の揺れ'],
      },
      {
        card: 'moon',
        position: 'upright',
        selectedFragmentIds: ['state-b', 'advice-b'],
        templateId: 'tpl-short-hushed-2',
        openerId: 'opener-shared-hushed-2',
        closingId: 'closing-shared-hushed-2',
        keywords: ['淡い不安'],
      },
      {
        card: 'moon',
        position: 'upright',
        selectedFragmentIds: ['state-c', 'advice-c'],
        templateId: 'tpl-medium-hushed-1',
        openerId: 'opener-shared-hushed-3',
        closingId: 'closing-shared-hushed-3',
        keywords: ['輪郭の曖昧さ'],
      },
      {
        card: 'moon',
        position: 'upright',
        selectedFragmentIds: ['state-d', 'advice-d'],
        templateId: 'tpl-medium-hushed-2',
        openerId: 'opener-shared-oracular-1',
        closingId: 'closing-shared-oracular-1',
        keywords: ['深夜の敏感さ'],
      },
      {
        card: 'moon',
        position: 'upright',
        selectedFragmentIds: ['state-e', 'advice-e'],
        templateId: 'tpl-long-hushed-1',
        openerId: 'opener-shared-oracular-2',
        closingId: 'closing-shared-oracular-2',
        keywords: ['まだ言葉にならない本音'],
      },
    ]

    const reading = generateReading(
      {
        cardId: 'moon',
        topic: 'love',
        tone: 'hushed',
        length: 'short',
        position: 'upright',
      },
      {
        rng: createSeededRng(9),
        history,
      },
    )

    expect(history.slice(0, 5).map((entry) => entry.openerId)).not.toContain(reading.openerId)
    expect(history.slice(0, 5).map((entry) => entry.closingId)).not.toContain(reading.closingId)
    expect(history.slice(0, 5).map((entry) => entry.templateId)).not.toContain(reading.templateId)
  })

  it('produces meaningfully different upright and reversed readings', () => {
    const upright = generateReading(
      {
        cardId: 'star',
        topic: 'self',
        tone: 'tender',
        length: 'medium',
        position: 'upright',
      },
      {
        rng: createSeededRng(100),
        history: [],
      },
    )
    const reversed = generateReading(
      {
        cardId: 'star',
        topic: 'self',
        tone: 'tender',
        length: 'medium',
        position: 'reversed',
      },
      {
        rng: createSeededRng(100),
        history: [],
      },
    )

    expect(upright.openerId).not.toBe(reversed.openerId)
    expect(upright.closingId).not.toBe(reversed.closingId)
    expect(upright.body).not.toBe(reversed.body)
  })

  it('avoids a recent cadence id when alternatives are available', () => {
    const input = {
      cardId: 'moon',
      topic: 'work',
      tone: 'tender',
      length: 'medium',
      position: 'upright',
    } as const
    const first = generateReading(input, {
      rng: createSeededRng(77),
      history: [],
    })
    const second = generateReading(input, {
      rng: createSeededRng(77),
      history: [
        {
          card: first.card,
          position: first.position,
          selectedFragmentIds: [],
          templateId: 'unrelated-template',
          openerId: 'unrelated-opener',
          closingId: 'unrelated-closing',
          cadenceId: first.cadenceId,
          tailSentence: '別の末尾です。',
          keywords: [],
        },
      ],
    })

    expect(first.cadenceId).toBeTruthy()
    expect(second.cadenceId).not.toBe(first.cadenceId)
    expect(second.tailSentence.length).toBeGreaterThan(0)
  })

  it('meets the uniqueness target for one fixed condition', () => {
    const bodies = new Set<string>()

    for (let index = 0; index < 1000; index += 1) {
      const reading = generateReading(
        {
          cardId: 'moon',
          topic: 'love',
          tone: 'hushed',
          length: 'short',
          position: 'upright',
        },
        {
          rng: createSeededRng(1000 + index),
          history: [],
        },
      )

      bodies.add(reading.body)
    }

    expect(bodies.size).toBeGreaterThanOrEqual(990)
  })
})
