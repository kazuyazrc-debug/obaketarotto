import { buildReadingSnapshot, type ReadingResult } from '../lib/reading'

type HistoryPanelProps = {
  history: ReadingResult[]
  onClear: () => void
  onOpenItem: (id: string) => void
}

export function HistoryPanel({ history, onClear, onOpenItem }: HistoryPanelProps) {
  return (
    <section className="panel history-panel">
      <div className="panel-head history-head">
        <div>
          <p className="panel-kicker">Step 3</p>
          <h2>履歴</h2>
          <p className="panel-note">あとで読み直して、変化した気持ちと比べられます。</p>
        </div>
        <button type="button" className="ghost-button" onClick={onClear}>
          履歴を消去
        </button>
      </div>

      {history.length > 0 ? (
        <div className="history-list">
          {history.map((reading) => {
            const snapshot = buildReadingSnapshot(reading)
            const historyKeyCard =
              reading.positions.find((position) => position.cardNo === reading.keyCardNo) ??
              reading.positions[0]

            return (
              <button
                key={reading.id}
                type="button"
                className="history-item"
                onClick={() => onOpenItem(reading.id)}
              >
                <span>{reading.input.intent}</span>
                <strong>{snapshot.headline}</strong>
                <p className="history-line">{snapshot.historyLine}</p>
                <div className="history-meta">
                  <small>{historyKeyCard ? `Key: ${historyKeyCard.cardName}` : reading.spread.name}</small>
                  <small>{new Date(reading.createdAt).toLocaleString('ja-JP')}</small>
                </div>
              </button>
            )
          })}
        </div>
      ) : (
        <p className="history-empty">履歴はまだありません。結果はこの端末のブラウザ内に保存されます。</p>
      )}
    </section>
  )
}
