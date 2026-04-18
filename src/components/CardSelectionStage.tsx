import { TarotCardFace } from './TarotCardFace'
import { getCardBackTheme } from '../lib/ritualTheme'

type RitualPhase = 'idle' | 'choosingCard' | 'chosenCardAnimating' | 'spreading' | 'complete'

type RitualSelectionCard = {
  no: number
  arcana: string
  person: string
  role: string
  motif: string
}

type CardSelectionStageProps = {
  currentIntent: string
  isLoading: boolean
  moonPhaseLabel: string
  phase: RitualPhase
  selectedCard: RitualSelectionCard | null
  selectedCardNo: number | null
  selectionCards: RitualSelectionCard[]
  onBack: () => void
  onChoose: (cardNo: number) => void | Promise<void>
}

export function CardSelectionStage({
  currentIntent,
  isLoading,
  moonPhaseLabel,
  phase,
  selectedCard,
  selectedCardNo,
  selectionCards,
  onBack,
  onChoose,
}: CardSelectionStageProps) {
  const isChoosing = phase === 'choosingCard'
  const isResolving = phase === 'chosenCardAnimating' || phase === 'spreading'

  return (
    <section className="panel ritual-panel">
      <div className="panel-head">
        <p className="panel-kicker">Step 2</p>
        <h2>直感で一枚選ぶ</h2>
        <p className="panel-note">
          迷いは整理しきれていなくても大丈夫です。{currentIntent}の読みにつながる札を、一枚だけ静かに選んでください。
        </p>
      </div>

      <div className="ritual-stage-head">
        <div>
          <p className="mini-label">Ritual</p>
          <h3>六芒の儀</h3>
        </div>
        {isChoosing ? (
          <button type="button" className="ghost-button" onClick={onBack}>
            入力へ戻る
          </button>
        ) : null}
      </div>

      <div className={`selection-fan phase-${phase}`}>
        {selectionCards.map((card, index) => {
          const isSelected = selectedCardNo === card.no
          const isDimmed = selectedCardNo !== null && !isSelected
          const isFaceUp = isSelected && phase !== 'choosingCard'
          const backTheme = getCardBackTheme(card.no)

          return (
            <button
              key={card.no}
              type="button"
              className={[
                'choice-card',
                isSelected ? 'is-selected' : '',
                isDimmed ? 'is-dimmed' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              style={{
                ['--slot' as string]: `${index - (selectionCards.length - 1) / 2}`,
                ['--card-count' as string]: `${selectionCards.length}`,
                ['--back-accent' as string]: backTheme.accent,
                ['--back-halo' as string]: backTheme.halo,
                ['--back-rotation' as string]: backTheme.rotation,
              }}
              disabled={!isChoosing}
              onClick={() => onChoose(card.no)}
            >
              {isFaceUp ? (
                <div className="choice-card-face">
                  <TarotCardFace
                    arcana={card.arcana}
                    role={card.role}
                    motif={card.motif}
                    cardNo={card.no}
                  />
                </div>
              ) : (
                <div className="choice-card-back">
                  <span className="choice-card-rune">{backTheme.rune}</span>
                  <span className="choice-card-phase">{moonPhaseLabel}</span>
                  <span className="choice-card-caption">moonlit arcana</span>
                </div>
              )}
            </button>
          )
        })}
      </div>

      <div className="ritual-caption">
        {isChoosing ? (
          <p>理由を考えすぎず、いま心が向いた一枚を選ぶと、その札が儀式の起点になります。</p>
        ) : selectedCard ? (
          <div className="ritual-selected-copy">
            <p className="mini-label">Chosen Card</p>
            <h3>
              {selectedCard.no}. {selectedCard.arcana}
            </h3>
            <p>
              {selectedCard.role} / {selectedCard.motif}
            </p>
            <p>
              {isLoading || isResolving
                ? '選ばれた札を起点に、六芒星の読みを静かに開いています。'
                : 'この札が、今回の儀式の入口になりました。'}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  )
}
