import type { ReadingResult } from './reading'

export type MoonPhaseTone = 'new' | 'crescent' | 'half' | 'gibbous' | 'full'

type MoonPhaseInfo = {
  tone: MoonPhaseTone
  label: string
  symbol: string
}

type CardBackTheme = {
  rune: string
  accent: string
  halo: string
  rotation: string
}

const moonPhases: Array<MoonPhaseInfo & { max: number }> = [
  { tone: 'new', label: '新月', symbol: '●', max: 2.2 },
  { tone: 'crescent', label: '細い月', symbol: '☾', max: 7.4 },
  { tone: 'half', label: '半月', symbol: '◐', max: 11.8 },
  { tone: 'gibbous', label: '満ちる月', symbol: '◕', max: 16.8 },
  { tone: 'full', label: '満月', symbol: '○', max: 21.6 },
  { tone: 'gibbous', label: '欠けゆく月', symbol: '◕', max: 25.3 },
  { tone: 'half', label: '下弦', symbol: '◑', max: 27.7 },
  { tone: 'crescent', label: '明けの月', symbol: '☽', max: 29.6 },
]

const backRunes = ['✦', '✧', '✶', '✷', '✹', '◈', '☽', '✺']
const backAccents = ['#d7c6a1', '#c7d1f0', '#e2cba7', '#c5bedc', '#d9d8bc', '#e0d8f7']
const backHalos = ['rgba(215,198,161,0.24)', 'rgba(197,209,240,0.24)', 'rgba(226,203,167,0.22)']

const positionPriority = ['現在', '未来', '全体運勢', '手段', '過去', 'マインドセット'] as const

export function getMoonPhaseInfo(date = new Date()): MoonPhaseInfo {
  const referenceNewMoon = Date.UTC(2024, 0, 11, 11, 57)
  const cycleDays = 29.53058867
  const daysSinceReference = (date.getTime() - referenceNewMoon) / 86_400_000
  const normalized = ((daysSinceReference % cycleDays) + cycleDays) % cycleDays

  return moonPhases.find((phase) => normalized <= phase.max) ?? moonPhases[0]
}

export function getCardBackTheme(cardNo: number): CardBackTheme {
  return {
    rune: backRunes[cardNo % backRunes.length],
    accent: backAccents[cardNo % backAccents.length],
    halo: backHalos[cardNo % backHalos.length],
    rotation: `${(cardNo % 7) * 9 - 27}deg`,
  }
}

export function buildCombinationTitle(reading: ReadingResult) {
  const selected = positionPriority
    .map((label) => reading.positions.find((position) => position.label === label))
    .filter((position): position is ReadingResult['positions'][number] => Boolean(position))
    .slice(0, 2)

  if (selected.length < 2) {
    const fallback = reading.positions[0]
    return fallback ? `「${fallback.cardName}が静かに灯る夜」` : '「星図がひらく夜」'
  }

  const [lead, echo] = selected
  const endings = ['重なる夜', '呼び合う宵', 'ひそかに響く刻', '交差する星図']
  const ending = endings[(lead.cardNo + echo.cardNo) % endings.length]

  return `「${lead.cardName}と${echo.cardName}が${ending}」`
}
