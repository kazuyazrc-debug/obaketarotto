import { useEffect, useState } from 'react'
import './App.css'
import { InputPanel } from './components/InputPanel'
import { ResultPanel } from './components/ResultPanel'
import { HistoryPanel } from './components/HistoryPanel'
import { CardSelectionStage } from './components/CardSelectionStage'
import { intentSupport } from './data/intentSupport'
import { cards, type CardDefinition } from './data/tarot'
import { buildReadingShareBlob } from './lib/share'
import {
  buildReadingSnapshot,
  createReading,
  type ReadingInput,
  type ReadingLength,
  type ReadingResult,
} from './lib/reading'
import { enhanceReadingWithAI } from './lib/ai'

type RitualPhase = 'idle' | 'choosingCard' | 'chosenCardAnimating' | 'spreading' | 'complete'

type RitualSelectionCard = Pick<CardDefinition, 'no' | 'arcana' | 'person' | 'role' | 'motif'>

const currentSpread = {
  name: '六芒スプレッド',
  description: '過去 / 現在 / 未来 / 手段 / マインドセット / 全体運勢の6面で流れを読む星図式',
  positions: ['過去', '現在', '未来', '手段', 'マインドセット', '全体運勢'],
}

const initialForm: ReadingInput = {
  nickname: '',
  intent: '仕事',
  question: '',
  timeframe: '今週',
  spreadId: 'sixfold',
  reversals: true,
  relationTheme: false,
  relationType: '',
  background: '',
}

function App() {
  const aiEnabled = import.meta.env.VITE_ENABLE_AI === 'true'
  const useAiEnhancement = false
  const [activeLength, setActiveLength] = useState<ReadingLength>('medium')
  const [latestReading, setLatestReading] = useState<ReadingResult | null>(null)
  const [history, setHistory] = useState<ReadingResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [notice, setNotice] = useState('')
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({})
  const [form, setForm] = useState<ReadingInput>(initialForm)
  const [ritualPhase, setRitualPhase] = useState<RitualPhase>('idle')
  const [selectionCards, setSelectionCards] = useState<RitualSelectionCard[]>([])
  const [selectedCardNo, setSelectedCardNo] = useState<number | null>(null)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const raw = window.localStorage.getItem('nica-tarot-history')
    if (!raw) return

    try {
      const parsed = JSON.parse(raw) as ReadingResult[]
      setHistory(parsed)
      setLatestReading(parsed[0] ?? null)
      if (parsed[0]) {
        setRitualPhase('complete')
      }
    } catch {
      window.localStorage.removeItem('nica-tarot-history')
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem('nica-tarot-history', JSON.stringify(history))
  }, [history])

  useEffect(() => {
    setExpandedCards({})
  }, [latestReading?.id])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const syncPreference = () => setPrefersReducedMotion(mediaQuery.matches)
    syncPreference()

    mediaQuery.addEventListener('change', syncPreference)
    return () => {
      mediaQuery.removeEventListener('change', syncPreference)
    }
  }, [])

  const currentSupport = intentSupport[form.intent]
  const latestSnapshot = latestReading ? buildReadingSnapshot(latestReading) : null
  const keyPosition = latestReading?.positions.find(
    (position) => position.cardNo === latestReading.keyCardNo,
  )
  const selectedCard =
    selectionCards.find((card) => card.no === selectedCardNo) ??
    cards.find((card) => card.no === selectedCardNo) ??
    null
  const isRitualActive = ritualPhase === 'choosingCard' || ritualPhase === 'chosenCardAnimating' || ritualPhase === 'spreading'

  function updateField<K extends keyof ReadingInput>(key: K, value: ReadingInput[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function applyQuestionTemplate(template: string) {
    updateField('question', template)
  }

  function toggleCardDetail(cardKey: string) {
    setExpandedCards((current) => ({ ...current, [cardKey]: !current[cardKey] }))
  }

  function startRitual() {
    if (!form.question.trim()) {
      return
    }

    setNotice('')
    setSelectedCardNo(null)
    setSelectionCards(pickSelectionCards(5))
    setRitualPhase('choosingCard')
  }

  function cancelRitual() {
    setSelectedCardNo(null)
    setSelectionCards([])
    setRitualPhase(latestReading ? 'complete' : 'idle')
  }

  async function handleChooseCard(cardNo: number) {
    if (ritualPhase !== 'choosingCard') {
      return
    }

    setSelectedCardNo(cardNo)
    setRitualPhase('chosenCardAnimating')
    setNotice('')
    setIsLoading(true)

    const preparedInput = prepareInput(form)
    const baseReading = createReading(preparedInput, { anchorCardNo: cardNo })
    const chosenDelay = prefersReducedMotion ? 0 : 340
    const totalRevealDelay = prefersReducedMotion ? 80 : 980

    window.setTimeout(() => {
      setRitualPhase('spreading')
    }, chosenDelay)

    const startedAt = Date.now()

    try {
      const reading =
        aiEnabled && useAiEnhancement
          ? await enhanceReadingWithAI(preparedInput, baseReading)
          : baseReading

      const remaining = Math.max(0, totalRevealDelay - (Date.now() - startedAt))
      if (remaining > 0) {
        await wait(remaining)
      }

      setLatestReading(reading)
      setHistory((current) => [reading, ...current].slice(0, 8))
      setRitualPhase('complete')

      if (aiEnabled && useAiEnhancement) {
        setNotice('AI文章強化を使って読みを整えました。')
      }
    } catch (error) {
      const remaining = Math.max(0, totalRevealDelay - (Date.now() - startedAt))
      if (remaining > 0) {
        await wait(remaining)
      }

      setLatestReading(baseReading)
      setHistory((current) => [baseReading, ...current].slice(0, 8))
      setRitualPhase('complete')
      setNotice(
        error instanceof Error
          ? `AI文章強化は使えませんでしたが、占い結果そのものは通常どおり表示できています。必要ならこのまま読み進めて大丈夫です。${error.message}`
          : 'AI文章強化は使えませんでしたが、占い結果そのものは通常どおり表示できています。必要ならこのまま読み進めて大丈夫です。',
      )
    } finally {
      setIsLoading(false)
    }
  }

  function openHistoryItem(id: string) {
    const found = history.find((reading) => reading.id === id) ?? null
    setLatestReading(found)
    setSelectedCardNo(found?.anchorCardNo ?? null)
    setSelectionCards([])
    setRitualPhase(found ? 'complete' : 'idle')
  }

  function clearHistory() {
    setHistory([])
    setLatestReading(null)
    setSelectedCardNo(null)
    setSelectionCards([])
    setRitualPhase('idle')
    window.localStorage.removeItem('nica-tarot-history')
  }

  async function handleShareImage() {
    if (!latestReading) return

    try {
      const blob = await buildReadingShareBlob(latestReading)
      const file = new File([blob], 'nica-tarot-reading.png', { type: 'image/png' })

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: 'nica家タロット',
          text: latestReading.summary.short,
          files: [file],
        })
        return
      }

      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = 'nica-tarot-reading.png'
      anchor.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      setNotice(
        error instanceof Error
          ? `画像共有の生成に失敗しました。${error.message}`
          : '画像共有の生成に失敗しました。',
      )
    }
  }

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">Moonlit Ritual of nica House</p>
          <h1 className="hero-title">おばけ👻のタロット占い：過去と現在から読み解く未来</h1>
          <p className="hero-subtitle">Refined Mystic Reading</p>
          <p className="lead">
            問いを書き、裏向きの札から一枚を選び、六芒へひらいていく参加型のタロットです。
            言葉より少し深い場所にある直感を、静かな手順で受け取れるように整えています。
          </p>
          <div className="hero-badges">
            <span>月光と銀のトーン</span>
            <span>六芒星スプレッド</span>
            <span>選んだ一枚から始まる儀式</span>
          </div>
        </div>

        <div className="hero-orbit" aria-hidden="true">
          <div className="orbit-card primary">PAST</div>
          <div className="orbit-card">PRESENT</div>
          <div className="orbit-card">FUTURE</div>
          <div className="orbit-card">METHOD</div>
          <div className="orbit-card">MIND</div>
          <div className="orbit-card">FATE</div>
        </div>
      </section>

      <section className="grid">
        <InputPanel
          currentSpread={currentSpread}
          currentSupport={currentSupport}
          form={form}
          isLoading={isLoading}
          isRitualActive={isRitualActive}
          onDraw={startRitual}
          onQuestionTemplate={applyQuestionTemplate}
          onUpdateField={updateField}
        />

        {isRitualActive ? (
          <CardSelectionStage
            currentIntent={form.intent}
            isLoading={isLoading}
            phase={ritualPhase}
            selectedCard={selectedCard}
            selectedCardNo={selectedCardNo}
            selectionCards={selectionCards}
            onBack={cancelRitual}
            onChoose={handleChooseCard}
          />
        ) : (
          <ResultPanel
            activeLength={activeLength}
            expandedCards={expandedCards}
            keyPosition={keyPosition}
            latestReading={latestReading}
            latestSnapshot={latestSnapshot}
            notice={notice}
            stepLabel={latestReading ? 'Step 3' : 'Step 2'}
            onSelectLength={setActiveLength}
            onShareImage={handleShareImage}
            onToggleCardDetail={toggleCardDetail}
          />
        )}
      </section>

      <HistoryPanel history={history} onClear={clearHistory} onOpenItem={openHistoryItem} />
    </main>
  )
}

function prepareInput(form: ReadingInput): ReadingInput {
  return {
    ...form,
    spreadId: 'sixfold',
    nickname: form.nickname.trim(),
    question: form.question.trim(),
    relationType: form.relationType.trim(),
    background: form.background.trim(),
  }
}

function pickSelectionCards(count: number): RitualSelectionCard[] {
  const pool = [...cards]
  const picked: RitualSelectionCard[] = []

  while (picked.length < count && pool.length > 0) {
    const index = Math.floor(Math.random() * pool.length)
    const [card] = pool.splice(index, 1)
    picked.push({
      no: card.no,
      arcana: card.arcana,
      person: card.person,
      role: card.role,
      motif: card.motif,
    })
  }

  return picked
}

function wait(duration: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, duration)
  })
}

export default App
