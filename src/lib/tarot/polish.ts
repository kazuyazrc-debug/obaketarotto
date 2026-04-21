import type { Reading } from './types'

export type Polisher = (
  reading: Reading,
  opts?: { model?: string; signal?: AbortSignal },
) => Promise<Reading>

export const identityPolisher: Polisher = async (reading) => reading
