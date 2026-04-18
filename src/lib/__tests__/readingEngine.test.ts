import { describe, expect, it } from 'vitest'
import { buildReadingSnapshot, createReading, type ReadingResult } from '../reading'

function createReadingFixture(): ReadingResult {
  return {
    id: 'reading-2',
    createdAt: '2026-04-16T00:00:00.000Z',
    input: {
      nickname: 'テスト',
      readingMode: 'deep',
      intent: '恋愛',
      question: '相手との距離感をどう整えるべき？',
      timeframe: '今週',
      spreadId: 'sixfold',
      reversals: false,
      relationTheme: true,
      relationType: '気になる相手',
      background: '最近やりとりはあるが、気持ちが読みにくい。',
    },
    spread: {
      id: 'sixfold',
      name: '六芒星スプレッド',
      description: '6枚で読む',
      cardCount: 6,
      positions: [
        { index: 0, label: '過去', weight: 0.72, prompt: 'これまでの流れ' },
        { index: 1, label: '現在', weight: 1, prompt: 'いまの中心' },
        { index: 2, label: '未来', weight: 0.88, prompt: 'この先' },
        { index: 3, label: '手段', weight: 0.82, prompt: '進め方' },
        { index: 4, label: 'マインドセット', weight: 0.8, prompt: '心の持ち方' },
        { index: 5, label: '全体運勢', weight: 0.92, prompt: '総合の傾向' },
      ],
    },
    keyCardNo: 6,
    keyCardReason: '現在と未来をつなぐ要です。',
    pairFocus: [],
    anchorCardNo: 6,
    summary: {
      short: '短い要約',
      medium: '中くらいの要約',
      long: '長い要約',
    },
    totalComment:
      '相手を急いで決めつけず、安心して話せる空気を先につくることが流れを整えます。',
    positions: [
      {
        label: '過去',
        prompt: 'これまでの流れ',
        cardNo: 18,
        cardName: '月',
        personLabel: 'フジツボクジラ',
        roleLabel: '感受性',
        motif: '揺らぎ',
        reversed: false,
        short: '不安を抱えていた',
        medium: '不安が先に立っていた',
        long: '曖昧な空気に心が揺れていた。',
      },
      {
        label: '現在',
        prompt: 'いまの中心',
        cardNo: 6,
        cardName: '恋人',
        personLabel: '粒あんこ',
        roleLabel: '選択',
        motif: '関係性',
        reversed: false,
        short: '今の選択が重要',
        medium: '関係をどう育てるかが中心',
        long: '相手との距離感をどう選ぶかが中心にある。',
      },
      {
        label: '未来',
        prompt: 'この先',
        cardNo: 19,
        cardName: '太陽',
        personLabel: '粒あんこ',
        roleLabel: '開示',
        motif: '明るさ',
        reversed: false,
        short: '明るい兆し',
        medium: '素直さが流れを明るくする',
        long: '明るく率直な対話が未来を開いていく。',
      },
      {
        label: '手段',
        prompt: '進め方',
        cardNo: 14,
        cardName: '節制',
        personLabel: 'まや',
        roleLabel: '調整',
        motif: 'バランス',
        reversed: false,
        short: 'ゆっくり整える',
        medium: '言葉の温度を整える',
        long: '踏み込みすぎず、安心できる温度で会話を重ねる。',
      },
      {
        label: 'マインドセット',
        prompt: '心の持ち方',
        cardNo: 2,
        cardName: '女教皇',
        personLabel: '藤宮ハスミ',
        roleLabel: '観察',
        motif: '静かな直感',
        reversed: false,
        short: '落ち着いて見る',
        medium: '反応を急いで決めつけない',
        long: '相手の言葉と態度を静かに受け止める姿勢が必要。',
      },
      {
        label: '全体運勢',
        prompt: '総合の傾向',
        cardNo: 21,
        cardName: '世界',
        personLabel: 'Re.',
        roleLabel: '完成',
        motif: 'まとまり',
        reversed: false,
        short: '関係は整いやすい',
        medium: '焦らなければまとまりやすい',
        long: '自然な積み重ねが関係全体を安定させる。',
      },
    ],
    disclaimer: 'これは内省のための読みです。',
  }
}

describe('buildReadingSnapshot', () => {
  it('六芒星スプレッド向けの要約を返す', () => {
    const snapshot = buildReadingSnapshot(createReadingFixture())

    expect(snapshot.headline).toContain('恋人')
    expect(snapshot.focus).toContain('節制')
    expect(snapshot.nextStep).toContain('節制')
    expect(snapshot.caution.length).toBeGreaterThan(0)
    expect(snapshot.historyLine).toContain('恋愛')
  })

  it('選んだ一枚をアンカーカードとして読みに含められる', () => {
    const reading = createReading(
      {
        nickname: 'テスト',
        readingMode: 'quick',
        intent: '仕事',
        question: '企画を通すために何を優先すべき？',
        timeframe: '今週',
        spreadId: 'sixfold',
        reversals: false,
        relationTheme: false,
        relationType: '',
        background: '',
      },
      { anchorCardNo: 1 },
    )

    expect(reading.anchorCardNo).toBe(1)
    expect(reading.positions.some((position) => position.cardNo === 1)).toBe(true)
  })
})
