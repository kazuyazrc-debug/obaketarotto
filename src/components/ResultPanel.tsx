import { useState } from 'react'
import { TarotCardFace } from './TarotCardFace'
import type { ReadingLength, ReadingResult, ReadingSnapshot } from '../lib/reading'
import { getRecipientLabel, sanitizeReadingText } from '../lib/readingDisplay'

const hexagramNodeClass = {
  過去: 'node-top',
  現在: 'node-upper-left',
  未来: 'node-upper-right',
  手段: 'node-lower-left',
  マインドセット: 'node-lower-right',
  全体運勢: 'node-bottom',
} as const

const hexagramLabels = ['過去', '現在', '未来', '手段', 'マインドセット', '全体運勢'] as const
type HexagramLabel = (typeof hexagramLabels)[number]
const recommendedVtubers = ['鬼屋敷ジオ', '藤宮ハスミ', '粒あんこ', '羊のぬーん'] as const

const readingLengthLabel: Record<ReadingLength, string> = {
  short: '短く',
  medium: '標準',
  long: '深く',
}

function findPosition(
  reading: ReadingResult,
  label: HexagramLabel,
) {
  return reading.positions.find((position) => position.label === label)
}

function buildSectionBody(
  label: HexagramLabel,
  position: ReadingResult['positions'][number] | undefined,
  fallback: string,
  sanitize: (text: string) => string,
) {
  if (!position) {
    return fallback
  }

  const oracleSeed =
    sanitize(position.short)
      .split('。')
      .map((segment) => segment.trim())
      .filter(Boolean)[0] ?? sanitize(position.short)

  switch (label) {
    case '過去':
      return `${position.cardName}は、ここまでの流れにまだ消えていない余韻があると告げる。「${oracleSeed}」という徴は、すでに今夜の選び方に静かに影を落とす。`
    case '現在':
      return `${position.cardName}は、いま目をそらせない論点が手元に来たと告げる。「${oracleSeed}」という合図は、避けるほど濃く輪郭を返す。`
    case '未来':
      return `${position.cardName}は、この先に開く景色が静かに姿を変え始めると告げる。「${oracleSeed}」という兆しは、いまの選び方ひとつで追い風にも試練にもなる。`
    default:
      return sanitize(position.medium)
  }
}

function pickRecommendedVtuber(reading: ReadingResult) {
  const seed =
    Number.parseInt(reading.id, 10) ||
    reading.positions.reduce((total, position, index) => total + position.cardNo * (index + 3), 0)

  return recommendedVtubers[Math.abs(seed) % recommendedVtubers.length]
}

function buildNextChapterBody(
  snapshot: ReadingSnapshot | null,
  keyPosition: ReadingResult['positions'][number] | undefined,
) {
  const actionLine =
    snapshot?.nextStep ?? 'まずは今夜のうちに、次の一歩をひとつだけ小さく決めてみてください。'
  const keyLine = keyPosition
    ? `${keyPosition.cardName}が鍵札に立っているので、${keyPosition.roleLabel}としての力を意識すると流れを掴みやすくなります。`
    : '今回は、ひとつの答えを急がずに全体の流れを整える姿勢が合っています。'
  const focusLine = snapshot?.focus
    ? `${snapshot.focus} そのうえで、気持ちと行動を切り分けて考えると迷いが言葉になっていきます。`
    : '気持ちと行動を切り分けて考えるほど、次に選ぶべきものが輪郭を持ちはじめます。'
  const closingLine = keyPosition
    ? `焦って大きく動くよりも、${keyPosition.cardName}が示した方向へ静かに軸を合わせることが、次章を開く近道です。`
    : '大きな結論を急がず、今日できる範囲の整え直しから始めると、次章の入口が見えやすくなります。'

  return `${actionLine}${keyLine}${focusLine}${closingLine}`
}

type ResultPanelProps = {
  activeLength: ReadingLength
  expandedCards: Record<string, boolean>
  keyPosition:
    | ReadingResult['positions'][number]
    | undefined
  latestReading: ReadingResult | null
  latestSnapshot: ReadingSnapshot | null
  notice: string
  stepLabel: string
  onHexagramHover: () => void
  onSelectLength: (length: ReadingLength) => void
  onShareImage: () => void
  onToggleCardDetail: (cardKey: string) => void
}

export function ResultPanel({
  activeLength,
  expandedCards,
  keyPosition,
  latestReading,
  latestSnapshot,
  notice,
  stepLabel,
  onHexagramHover,
  onSelectLength,
  onShareImage,
  onToggleCardDetail,
}: ResultPanelProps) {
  const [hoveredLabel, setHoveredLabel] = useState<HexagramLabel | null>(null)
  const currentPosition = latestReading ? findPosition(latestReading, '現在') : undefined
  const pastPosition = latestReading ? findPosition(latestReading, '過去') : undefined
  const futurePosition = latestReading ? findPosition(latestReading, '未来') : undefined
  const recipientLabel = latestReading ? getRecipientLabel(latestReading.input.nickname) : 'あなた'
  const sanitize = (text: string) => sanitizeReadingText(text, latestReading)
  const recommendedVtuber = latestReading ? pickRecommendedVtuber(latestReading) : null

  function handleHexagramEnter(label: HexagramLabel) {
    setHoveredLabel((current) => {
      if (current !== label) {
        onHexagramHover()
      }

      return label
    })
  }

  function clearHexagramHover() {
    setHoveredLabel(null)
  }

  return (
    <section className="panel result-panel">
      <div className="panel-head">
        <p className="panel-kicker">{stepLabel}</p>
        <h2>結果を読む</h2>
        <p className="panel-note">
          まず上の六芒星で札の配置をつかみ、そのあとで各位置の意味をゆっくり読み解ける構成です。
        </p>
      </div>

      {latestReading ? (
        <>
          <div className="hexagram-card">
            <div className="hexagram-head">
              <div>
                <p className="mini-label">Sixfold Map</p>
                <h3>六芒星の配置</h3>
              </div>
              <p className="hexagram-note">選ばれた札がどの位置に立ったかを、先に全体図で見渡せます。</p>
            </div>

            <div className="hexagram-map" aria-label="六芒星のカード配置">
              <svg
                className="hexagram-lines"
                viewBox="0 0 100 100"
                role="presentation"
                aria-hidden="true"
              >
                <polygon points="50,10 23,58 77,58" />
                <polygon points="50,90 23,42 77,42" />
                <circle cx="50" cy="50" r="5.5" />
              </svg>

              <div className="hexagram-core">
                <span>六芒星</span>
                <strong>{latestReading.spread.name}</strong>
              </div>

              {hexagramLabels.map((label, index) => {
                const position = latestReading.positions.find((entry) => entry.label === label)
                if (!position) return null

                return (
                  <div
                    key={`hexagram-${label}-${position.cardNo}`}
                    className={[
                      'hexagram-node',
                      hexagramNodeClass[label],
                      position.cardNo === latestReading.keyCardNo ? 'is-key-node' : '',
                      hoveredLabel === position.label ? 'is-linked-active' : '',
                      hoveredLabel && hoveredLabel !== position.label ? 'is-linked-dim' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    style={{ animationDelay: `${0.14 + index * 0.08}s` }}
                    tabIndex={0}
                    onMouseEnter={() => handleHexagramEnter(position.label as HexagramLabel)}
                    onMouseLeave={clearHexagramHover}
                    onFocus={() => handleHexagramEnter(position.label as HexagramLabel)}
                    onBlur={clearHexagramHover}
                  >
                    <span className="hexagram-label">{position.label}</span>
                    <strong className="hexagram-cardline">
                      <span className="hexagram-cardno">{position.cardNo}.</span>
                      <span className="hexagram-cardname">{position.cardName}</span>
                    </strong>
                    <small className="hexagram-role">{position.roleLabel}</small>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="summary-card total-comment-card">
            <p className="summary-label">星巡りの帰結と次章</p>
            <div className="total-flow-grid">
              <article className="total-flow-section">
                <div className="total-flow-head">
                  <p className="mini-label">Past</p>
                  <h3 className="total-flow-title">過去</h3>
                </div>
                <p className="total-flow-body">
                  {buildSectionBody(
                    '過去',
                    pastPosition,
                    'ここまでに積み重なった背景は静かですが、確かに今の流れへつながっています。',
                    sanitize,
                  )}
                </p>
              </article>

              <article className="total-flow-section is-current">
                <div className="total-flow-head">
                  <p className="mini-label">Present</p>
                  <h3 className="total-flow-title">現在</h3>
                </div>
                <p className="total-flow-body">
                  {buildSectionBody(
                    '現在',
                    currentPosition,
                    'いま最も強く出ている空気を受け止めることが、今回の読みの入口です。',
                    sanitize,
                  )}
                </p>
              </article>

              <article className="total-flow-section">
                <div className="total-flow-head">
                  <p className="mini-label">Future</p>
                  <h3 className="total-flow-title">未来</h3>
                </div>
                <p className="total-flow-body">
                  {buildSectionBody(
                    '未来',
                    futurePosition,
                    'この先に見える兆しは、いまの選び方によって穏やかに形を変えていきます。',
                    sanitize,
                  )}
                </p>
              </article>

              <article className="total-flow-section total-flow-closing">
                <div className="total-flow-head">
                  <p className="mini-label">Next Chapter</p>
                  <h3 className="total-flow-title">次章への指針</h3>
                </div>
                <p className="total-flow-body">
                  {buildNextChapterBody(latestSnapshot, keyPosition)}
                </p>
              </article>
            </div>
            <div className="result-buttons">
              <button type="button" className="ghost-button" onClick={onShareImage}>
                共有画像を保存
              </button>
            </div>
          </div>

          {latestSnapshot ? (
            <div className="result-overview refined-overview">
              <article className="overview-card">
                <p className="mini-label">Tonight</p>
                <h3>今回の核</h3>
                <p>{sanitize(latestSnapshot.headline)}</p>
              </article>
              <article className="overview-card">
                <p className="mini-label">Axis</p>
                <h3>いま整える軸</h3>
                <p>{sanitize(latestSnapshot.nextStep)}</p>
              </article>
            </div>
          ) : null}

          <div className="key-card">
            <div>
              <p className="mini-label">Key Card</p>
              <h3>今回の鍵札</h3>
              <p className="key-card-line">
                {latestReading.keyCardNo} / {keyPosition?.cardName}
              </p>
              <p className="role-line">
                {keyPosition?.roleLabel} / {keyPosition?.motif}
              </p>
            </div>
            <p className="key-reason">{sanitize(latestReading.keyCardReason)}</p>
          </div>

          <div className="tab-row">
            {(['short', 'medium', 'long'] as ReadingLength[]).map((length) => (
              <button
                key={length}
                type="button"
                className={length === activeLength ? 'tab active' : 'tab'}
                onClick={() => onSelectLength(length)}
              >
                {readingLengthLabel[length]}
              </button>
            ))}
          </div>

          {recommendedVtuber ? (
            <article className="stage-recommendation-card summary-recommendation-card">
              <p className="mini-label">Bonus Pick</p>
              <h3>あなたにおすすめのVtuber</h3>
              <p className="stage-recommendation-name">{recommendedVtuber}</p>
            </article>
          ) : null}

          <div className="summary-card">
            <p className="summary-label">全体の読み取りについて</p>
            <p className="mini-label">{recipientLabel}へ</p>
            <p>{sanitize(latestReading.summary[activeLength])}</p>
          </div>

          <div className="spread-stage">
            <div className="spread-stage-head">
              <div>
                <p className="mini-label">Reading Sequence</p>
                <h3>まず読む順</h3>
              </div>
              <p className="spread-stage-note">
                過去から現在、未来へ流れを追い、そのあと手段・マインドセット・全体運勢へ進むと全体像を掴みやすくなります。
              </p>
            </div>
            {latestReading.positions.map((position, index) => {
              const cardKey = `${latestReading.id}-${position.label}-${position.cardNo}`
              const showLong = activeLength === 'long' || Boolean(expandedCards[cardKey])
              const meaning = showLong
                ? sanitize(position.long)
                : activeLength === 'short'
                  ? sanitize(position.short)
                  : sanitize(position.medium)

              return (
                <article
                  key={`stage-${position.label}-${position.cardNo}`}
                    className={[
                      'stage-card',
                      position.cardNo === latestReading.keyCardNo ? 'is-key-stage' : '',
                      hoveredLabel === position.label ? 'is-linked-active' : '',
                      hoveredLabel && hoveredLabel !== position.label ? 'is-linked-dim' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    style={{ animationDelay: `${0.24 + index * 0.08}s` }}
                    onMouseEnter={() => setHoveredLabel(position.label as HexagramLabel)}
                    onMouseLeave={() => setHoveredLabel(null)}
                    onFocusCapture={() => setHoveredLabel(position.label as HexagramLabel)}
                    onBlurCapture={() => setHoveredLabel(null)}
                >
                  <div className="stage-order-rail" aria-hidden="true">
                    <span className="stage-order-badge">{String(index + 1).padStart(2, '0')}</span>
                    {index < latestReading.positions.length - 1 ? (
                      <span className="stage-order-line" />
                    ) : null}
                  </div>
                  <TarotCardFace
                    arcana={position.cardName}
                    role={position.roleLabel}
                    motif={position.motif}
                    cardNo={position.cardNo}
                    reversed={position.reversed}
                  />
                  <div className="stage-copy">
                    <div className="position-topline">
                      <span className="position-sequence">読む順 {index + 1}</span>
                      <span>{position.label}</span>
                      <span>{position.prompt}</span>
                    </div>
                    <h3>
                      {position.cardNo}. {position.cardName}
                      {position.reversed ? ' (逆位置)' : ''}
                    </h3>
                    <p className="role-line">
                      {position.roleLabel} / {position.motif}
                    </p>
                    <p className="meaning-line">{meaning}</p>
                    {activeLength !== 'long' ? (
                      <button
                        type="button"
                        className="detail-toggle"
                        onClick={() => onToggleCardDetail(cardKey)}
                      >
                        {showLong ? '通常表示に戻す' : 'この札を深く読む'}
                      </button>
                    ) : null}
                  </div>
                </article>
              )
            })}
            {recommendedVtuber ? (
              <article className="stage-recommendation-card">
                <p className="mini-label">Bonus Pick</p>
                <h3>あなたに今おすすめのVtuber</h3>
                <p className="stage-recommendation-name">{recommendedVtuber}</p>
                <p className="stage-recommendation-note">
                  今夜の流れに寄り添う相手として、ふっと目に留まる名前です。気になったら、その空気感ごと受け取ってみてください。
                </p>
              </article>
            ) : null}
          </div>

          {notice ? <p className="helper-note notice">{notice}</p> : null}
          <p className="disclaimer">{latestReading.disclaimer}</p>
        </>
      ) : (
        <div className="empty-state">
          <p className="empty-kicker">次は質問をひとつ選ぶ番です</p>
          <p>悩みを書き終えたら、儀式のステップで一枚を選び、そのあと六芒星の読みへ進めます。</p>
        </div>
      )}
    </section>
  )
}

