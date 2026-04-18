import type { IntentSupport } from '../data/intentSupport'
import {
  intentOptions,
  timeframeOptions,
  type IntentCategory,
  type TimeframeOption,
} from '../data/tarot'
import type { ReadingInput } from '../lib/reading'

type ReadingMode = ReadingInput['readingMode']

type SpreadPreview = {
  name: string
  description: string
  positions: string[]
}

type InputPanelProps = {
  currentSpread: SpreadPreview
  currentSupport: IntentSupport
  form: ReadingInput
  isLoading: boolean
  isRitualActive: boolean
  moonPhaseLabel: string
  onDraw: () => void | Promise<void>
  onQuestionTemplate: (template: string) => void
  onUpdateField: <K extends keyof ReadingInput>(key: K, value: ReadingInput[K]) => void
}

const readingModeCopy: Record<
  ReadingMode,
  {
    title: string
    lead: string
    detail: string
    rows: number
  }
> = {
  quick: {
    title: 'ひとことモード',
    lead: '一文だけでも大丈夫です。重い日でも、今夜いちばん気になる輪郭だけ置けます。',
    detail: '背景入力は省いて、短く直感的に進めます。',
    rows: 3,
  },
  deep: {
    title: 'しっかり相談モード',
    lead: '背景や迷いの前後関係まで含めて、少し丁寧に読みたい時のモードです。',
    detail: '補足の背景欄も使って、文脈ごと整えられます。',
    rows: 5,
  },
}

const questionLabels: Record<IntentCategory, string> = {
  恋愛: 'いま、恋愛で占いたいこと',
  仕事: 'いま、仕事で占いたいこと',
  人間関係: 'いま、人間関係で占いたいこと',
  配信活動: 'いま、配信活動で占いたいこと',
  創作: 'いま、創作で占いたいこと',
  学業: 'いま、学業で占いたいこと',
  メンタル: 'いま、気持ちの面で占いたいこと',
  その他: 'いま、占いたいこと',
}

const questionPlaceholders: Record<IntentCategory, string> = {
  恋愛: 'いま気になっていること、迷っていること、相手とのことなどを自由に書いてください。',
  仕事: '仕事で気になっている流れ、判断、悩み、進め方などを自由に書いてください。',
  人間関係: '誰かとの関係で気になっていることや、整理したい気持ちを自由に書いてください。',
  配信活動: '配信の方向性、見せ方、続け方、反応への迷いなどを自由に書いてください。',
  創作: '作りたいもの、進まない理由、次の一手などを自由に書いてください。',
  学業: '勉強の進め方、目標、不安、迷いなどを自由に書いてください。',
  メンタル: 'いまの心の重さや揺れ、整えたいことを自由に書いてください。',
  その他: 'ジャンルを決めきれなくても大丈夫です。いま占いたいことを自由に書いてください。',
}

const timeframeDescriptions: Record<TimeframeOption, string> = {
  今日: '今日の流れと手応えを読む',
  明日: '明日へ向けた兆しを映す',
  今週: '今週の動きと整え方を見る',
  来週: '次の一週間の備えを掴む',
  来月: '来月へ続く変化を見渡す',
  今年: '今年を通した巡りを確かめる',
}

const timeframeBands: Record<TimeframeOption, { label: '短期' | '中期' | '長期'; tone: string }> = {
  今日: { label: '短期', tone: 'short' },
  明日: { label: '短期', tone: 'short' },
  今週: { label: '中期', tone: 'middle' },
  来週: { label: '中期', tone: 'middle' },
  来月: { label: '長期', tone: 'long' },
  今年: { label: '長期', tone: 'long' },
}

const timeframeIntentLead: Record<TimeframeOption, string> = {
  今日: '今日はごく近い空気と、その場で触れられる変化に焦点が当たります。',
  明日: '明日までの流れでは、直近の判断やひと言の影響が見えやすくなります。',
  今週: '今週は動き始める流れと、整え直しの効く地点が浮かびやすい時間幅です。',
  来週: '来週を見る時は、次の展開へ向けた仕込みや備えが読みの中心になります。',
  来月: '来月にかけては、変化がどう形になるかを少し引いた視点で見渡せます。',
  今年: '今年の読みでは、積み上げや方向転換まで含めた長い流れを扱います。',
}

const intentLead: Record<IntentCategory, string> = {
  仕事: '仕事では、優先順位と現実的な打ち手を先に見ると読みが活きます。',
  配信活動: '配信活動では、見せ方の軸と続け方の温度感に注目すると輪郭が出ます。',
  恋愛: '恋愛では、相手を当てるよりも感情の温度差や距離感の揺れを見る読みです。',
  人間関係: '人間関係では、距離の取り方と役割の偏りに目を向けると分かりやすくなります。',
  創作: '創作では、ひらめきそのものより形にする手前の詰まりを読むと具体的です。',
  学業: '学業では、努力量よりも学び方の配分と続け方の癖を見ると実行しやすくなります。',
  メンタル: 'メンタルでは、無理に前向きさを作るより負荷の出どころを見分ける読みになります。',
  その他: 'まだ言葉にしきれていない迷いでも、いま重い論点から順に照らしていけます。',
}

function buildIntentTimeframeHint(intent: IntentCategory, timeframe: TimeframeOption) {
  return `${timeframeIntentLead[timeframe]} ${intentLead[intent]}`
}

export function InputPanel({
  currentSpread,
  currentSupport,
  form,
  isLoading,
  isRitualActive,
  moonPhaseLabel,
  onDraw,
  onQuestionTemplate,
  onUpdateField,
}: InputPanelProps) {
  const questionLabel = questionLabels[form.intent]
  const questionPlaceholder =
    form.readingMode === 'quick'
      ? `${questionPlaceholders[form.intent]} 一文だけでも大丈夫です。`
      : questionPlaceholders[form.intent]
  const modeCopy = readingModeCopy[form.readingMode]
  const visibleTemplates =
    form.readingMode === 'quick' ? currentSupport.prompts.slice(0, 3) : currentSupport.prompts

  return (
    <section className="panel form-panel">
      <div className="panel-head">
        <p className="panel-kicker">Step 1</p>
        <h2>占いたいことを教えてください</h2>
      </div>

      <div className="field-grid compact-grid">
        <label>
          あなたのお名前
          <input
            value={form.nickname}
            onChange={(event) => onUpdateField('nickname', event.target.value)}
            placeholder="未入力なら『あなた』で表示"
          />
        </label>

        <label>
          占いたい事
          <select
            value={form.intent}
            onChange={(event) => onUpdateField('intent', event.target.value as IntentCategory)}
          >
            {intentOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <div className="field-shell reading-mode-field">
          <div className="reading-mode-head">
            <span>相談モード</span>
            <small>{modeCopy.detail}</small>
          </div>
          <div className="reading-mode-switch" role="radiogroup" aria-label="相談モード">
            {(
              [
                ['quick', 'ひとことモード', '短く始める'],
                ['deep', 'しっかり相談モード', '背景まで読む'],
              ] as const
            ).map(([mode, title, subtitle]) => {
              const isActive = form.readingMode === mode

              return (
                <button
                  key={mode}
                  type="button"
                  className={`reading-mode-chip${isActive ? ' active' : ''}`}
                  aria-pressed={isActive}
                  onClick={() => onUpdateField('readingMode', mode)}
                >
                  <strong>{title}</strong>
                  <small>{subtitle}</small>
                </button>
              )
            })}
          </div>
        </div>

        <div className="field-shell timeframe-field">
          <div className="timeframe-head">
            <span>時間軸</span>
            <small>読みたい近さにいちばん近いものを選んでください</small>
          </div>
          <div className="timeframe-chip-grid" role="radiogroup" aria-label="時間軸">
            {timeframeOptions.map((option) => {
              const isActive = form.timeframe === option
              const band = timeframeBands[option]

              return (
                <button
                  key={option}
                  type="button"
                  className={`timeframe-chip${isActive ? ' active' : ''}`}
                  aria-pressed={isActive}
                  onClick={() => onUpdateField('timeframe', option)}
                >
                  <div className="timeframe-chip-top">
                    <span className={`timeframe-chip-icon is-${band.tone}`} aria-hidden="true" />
                    <span className={`timeframe-chip-band is-${band.tone}`}>{band.label}</span>
                  </div>
                  <strong>{option}</strong>
                  <small>{timeframeDescriptions[option]}</small>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="intent-support-card">
        <div className="intent-support-head">
          <div>
            <p className="guidance-title">書き方の導き</p>
            <p className="intent-support-note">{modeCopy.lead}</p>
            <p className="intent-context-hint">{buildIntentTimeframeHint(form.intent, form.timeframe)}</p>
          </div>
          <p className="support-phase-note">今夜の月相: {moonPhaseLabel}</p>
        </div>
        <div className="template-list compact-template-list">
          {visibleTemplates.map((template) => (
            <button
              key={template}
              type="button"
              className="template-chip"
              onClick={() => onQuestionTemplate(template)}
            >
              {template}
            </button>
          ))}
        </div>
      </div>

      <label className="block-field primary-field">
        {questionLabel}
        <textarea
          rows={modeCopy.rows}
          value={form.question}
          onChange={(event) => onUpdateField('question', event.target.value)}
          placeholder={questionPlaceholder}
        />
      </label>

      {form.readingMode === 'deep' ? (
        <label className="block-field">
          {currentSupport.backgroundLabel}
          <textarea
            rows={4}
            value={form.background}
            maxLength={300}
            onChange={(event) => onUpdateField('background', event.target.value)}
            placeholder={currentSupport.backgroundPlaceholder}
          />
        </label>
      ) : null}

      <div className="ritual-field-display spread-display-bottom">
        <span className="mini-label">Spread</span>
        <strong>{currentSpread.name}</strong>
        <p>{currentSpread.description}</p>
        <div className="spread-position-row" aria-label="六芒スプレッドの配置">
          {currentSpread.positions.map((position) => (
            <span key={position}>{position}</span>
          ))}
        </div>
      </div>

      <button
        className="draw-button ritual-button"
        type="button"
        onClick={onDraw}
        disabled={!form.question.trim() || isLoading || isRitualActive}
      >
        {isLoading || isRitualActive ? '儀式を整えています…' : '六芒の儀を始める'}
      </button>

      <details className="details-panel details-panel-subtle">
        <summary>詳細設定</summary>

        <div className="toggle-row advanced-toggle-row">
          <label>
            <input
              type="checkbox"
              checked={form.reversals}
              onChange={(event) => onUpdateField('reversals', event.target.checked)}
            />
            逆位置も読む
          </label>
          <label>
            <input
              type="checkbox"
              checked={form.relationTheme}
              onChange={(event) => onUpdateField('relationTheme', event.target.checked)}
            />
            関係性がテーマ
          </label>
        </div>

        {form.relationTheme ? (
          <label className="block-field nested-field">
            関係性の種類
            <input
              value={form.relationType}
              onChange={(event) => onUpdateField('relationType', event.target.value)}
              placeholder="恋人 / 友人 / 家族 / 同僚 / 配信仲間 など"
            />
          </label>
        ) : null}
      </details>
    </section>
  )
}


