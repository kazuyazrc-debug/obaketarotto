import {
  cards,
  defaultDisclaimer,
  spreads,
  type CardDefinition,
  type IntentCategory,
  type ReadingLength,
  type SpreadDefinition,
  type SpreadId,
  type TimeframeOption,
} from '../data/tarot'
import { getRecipientLabel } from './readingDisplay'

export type DrawnCard = {
  no: number
  reversed: boolean
}

export type ReadingInput = {
  nickname: string
  intent: IntentCategory
  question: string
  timeframe: TimeframeOption
  spreadId: SpreadId
  reversals: boolean
  relationTheme: boolean
  relationType: string
  background: string
}

export type ReadingPositionResult = {
  label: string
  prompt: string
  cardNo: number
  cardName: string
  personLabel: string
  roleLabel: string
  motif: string
  reversed: boolean
  short: string
  medium: string
  long: string
}

export type ReadingResult = {
  id: string
  createdAt: string
  input: ReadingInput
  spread: SpreadDefinition
  keyCardNo: number
  keyCardReason: string
  pairFocus: string[]
  summary: Record<ReadingLength, string>
  totalComment: string
  positions: ReadingPositionResult[]
  disclaimer: string
  anchorCardNo: number | null
}

export type ReadingSnapshot = {
  headline: string
  focus: string
  nextStep: string
  caution: string
  historyLine: string
}

type CreateReadingOptions = {
  anchorCardNo?: number | null
}

const intentAngle: Record<IntentCategory, string> = {
  仕事: '課題の整理と実行順序',
  配信活動: '配信の軸と見せ方の再調整',
  恋愛: '本音と距離感の調律',
  人間関係: '関係の温度と境界線',
  創作: '発想と試作の流れ',
  学業: '学び方と継続の整え方',
  メンタル: '負荷の観察とセルフケア',
  その他: '状況整理と次の一歩',
}

const timeframeAngle: Record<TimeframeOption, string> = {
  今日: '今日の流れと、いま触れられる一手を読む時間幅',
  明日: '明日までの変化と、直近の判断を読む時間幅',
  今週: '今週のうちに動きやすい変化を読む時間幅',
  来週: '来週に向けて整う流れや準備を読む時間幅',
  来月: '来月にかけて形になっていく流れを眺める期間',
  今年: '今年を通した積み上げや方向転換まで見渡す期間',
}

const intentStyle: Record<
  IntentCategory,
  {
    analysis: string
    action: string
    closing: string
  }
> = {
  仕事: {
    analysis: '感情よりも優先順位と判断基準の整理が効きやすい局面です。',
    action:
      '次の一手は、やることを増やすより「何を先に形にするか」を明確にすることです。',
    closing: '順番を整えるだけでも、手応えは静かに戻ってきます。',
  },
  配信活動: {
    analysis: '配信活動では、勢いよりも見せ方・続け方・反応の受け取り方の整理が効きやすい局面です。',
    action:
      '次の一手は、全部を良くしようとするより「何を魅力として見せるか」を一度絞ることです。',
    closing: '軸が整うほど、配信の空気も反応も少しずつ安定していきます。',
  },
  恋愛: {
    analysis: '相手の気持ちを当てにいくより、関係の呼吸をどう整えるかを見る読みです。',
    action:
      '急いで結論を取りに行くより、安心して本音を交わせる場づくりが効きます。',
    closing: 'やさしい誠実さは、関係を思った以上に前へ進めます。',
  },
  人間関係: {
    analysis: '善悪よりも、距離感と役割の偏りを整えることが鍵になります。',
    action:
      '無理に理解されようとするより、伝える線と譲る線を分けていくのが有効です。',
    closing: '静かな線引きは、関係を壊すためではなく守るために働きます。',
  },
  創作: {
    analysis: 'ひらめきの量より、見せられる試作へ落とせるかが流れを決めます。',
    action:
      '完成度を上げる前に、小さく公開できる形を一つ作ると流れが生まれます。',
    closing: '作品は、出した瞬間から次の景色を見せてくれます。',
  },
  学業: {
    analysis: '努力量の問題というより、学び方の配分と復習導線の調整が重要です。',
    action:
      '全部を均等にやるより、伸ばすべき単元を絞って反復の型を決めると安定します。',
    closing: '整った反復は、自信のなさを静かに上書きしていきます。',
  },
  メンタル: {
    analysis: '勢いで突破するより、負荷の正体を見分けて回復の余白を確保する読みです。',
    action:
      'いまは無理に前向きさを作るより、削れる負担を一つ減らすことが実務的です。',
    closing:
      '負荷が強いときは一人で抱え込まず、信頼できる人や必要な支援先にも頼って大丈夫です。',
  },
  その他: {
    analysis: '状況を大きく動かす前に、何が核で何がノイズかを見分ける段階です。',
    action: '迷いを減らすには、次の一歩を小さく具体化することが近道になります。',
    closing: '小さな確定は、曖昧さの中でも確かな前進になります。',
  },
}

export function createReading(
  input: ReadingInput,
  options: CreateReadingOptions = {},
): ReadingResult {
  const spread = spreads.find((entry) => entry.id === input.spreadId) ?? spreads[2]
  const deck = drawCards(spread.cardCount, input.reversals, options.anchorCardNo ?? null)
  const positions = spread.positions.map((position, index) =>
    buildPositionResult(position, deck[index], input),
  )
  const keyCard = chooseKeyCard(positions, spread)
  const pairFocus = buildPairFocus(positions)

  return {
    id: `${Date.now()}`,
    createdAt: new Date().toISOString(),
    input,
    spread,
    keyCardNo: keyCard.cardNo,
    keyCardReason: keyCard.reason,
    pairFocus,
    summary: buildSummary(positions, input, spread, keyCard.roleLabel, pairFocus),
    totalComment: buildTotalComment(positions, input, keyCard.roleLabel),
    positions,
    disclaimer: defaultDisclaimer,
    anchorCardNo: options.anchorCardNo ?? null,
  }
}

function drawCards(count: number, reversals: boolean, anchorCardNo: number | null): DrawnCard[] {
  const pool = [...cards]
  const drawn: DrawnCard[] = []

  if (anchorCardNo !== null) {
    const anchorIndex = pool.findIndex((card) => card.no === anchorCardNo)
    if (anchorIndex >= 0) {
      const [anchorCard] = pool.splice(anchorIndex, 1)
      drawn.push({
        no: anchorCard.no,
        reversed: reversals ? Math.random() < 0.35 : false,
      })
    }
  }

  while (drawn.length < count && pool.length > 0) {
    const index = Math.floor(Math.random() * pool.length)
    const [card] = pool.splice(index, 1)

    drawn.push({
      no: card.no,
      reversed: reversals ? Math.random() < 0.35 : false,
    })
  }

  return shuffle(drawn)
}

function buildPositionResult(
  position: SpreadDefinition['positions'][number],
  drawnCard: DrawnCard,
  input: ReadingInput,
): ReadingPositionResult {
  const card = cards.find((entry) => entry.no === drawnCard.no)

  if (!card) {
    throw new Error(`Card ${drawnCard.no} not found`)
  }

  const tone = drawnCard.reversed ? card.shadow : card.light
  const stanceLine = drawnCard.reversed
    ? `逆位置なので、注意点としては「${card.shadow}」が強く出やすい状態です。`
    : `正位置なので、「${card.light}」をそのまま活かしやすい状態です。`
  const backgroundLine = input.background
    ? `背景として「${summarizeBackground(input.background)}」という文脈も今回の読みに影を落としています。`
    : ''
  const actionLine = card.actions.length > 0
    ? `行動に移すなら、まずは「${card.actions[0]}」が有効です。`
    : ''
  const secondActionLine = card.actions[1]
    ? `余裕があれば「${card.actions[1]}」まで進めると、この札の意味を現実に落とし込みやすくなります。`
    : ''

  return {
    label: position.label,
    prompt: position.prompt,
    cardNo: card.no,
    cardName: card.arcana,
    personLabel: card.person,
    roleLabel: card.role,
    motif: card.motif,
    reversed: drawnCard.reversed,
    short: `${card.shortLine}${drawnCard.reversed ? ' 影の出方も合わせて意識したい場面です。' : ''}`,
    medium: `${position.label}に出たのは ${card.arcana} です。この位置は「${position.prompt}」を表しており、今回は ${card.role} として ${card.motif} が強く働いています。つまり、${tone} ${actionLine}`,
    long: `${position.label}に出たのは ${card.arcana} です。この位置は「${position.prompt}」を示しています。今回の読みでは、${card.role} として ${card.motif} が前面に出ており、意味としては「${card.shortLine}」に近い流れです。${stanceLine} ${input.intent}の読みでは「${intentAngle[input.intent]}」を意識して受け取ると解釈しやすく、時間軸は ${input.timeframe} なので、${timeframeAngle[input.timeframe]} として考えるのが現実的です。${actionLine}${secondActionLine}${backgroundLine}`,
  }
}

function chooseKeyCard(positions: ReadingPositionResult[], spread: SpreadDefinition) {
  let bestIndex = 0
  let bestScore = Number.NEGATIVE_INFINITY

  positions.forEach((position, index) => {
    const spreadWeight = spread.positions[index]?.weight ?? 0.5
    const base = spreadWeight * 10
    const reversalPenalty = position.reversed ? -0.6 : 0
    const score = base + position.cardNo / 100 + reversalPenalty

    if (score > bestScore) {
      bestScore = score
      bestIndex = index
    }
  })

  const picked = positions[bestIndex]

  return {
    ...picked,
    reason: `${picked.label}はこのスプレッドで重みが高く、今回の読みの焦点と実務的な判断軸をいちばん集めている札です。`,
  }
}

function buildPairFocus(positions: ReadingPositionResult[]) {
  const roleCounts = positions.reduce<Record<string, number>>((acc, position) => {
    acc[position.roleLabel] = (acc[position.roleLabel] ?? 0) + 1
    return acc
  }, {})

  return Object.entries(roleCounts)
    .filter(([, count]) => count >= 2)
    .map(
      ([role]) =>
        `${role}の気配が複数位置で重なっています。今回は同じ資質が別の場面にも連動して現れやすく、その性質が読み全体の通しテーマになっています。`,
    )
}

function buildSummary(
  positions: ReadingPositionResult[],
  input: ReadingInput,
  spread: SpreadDefinition,
  keyRole: string,
  pairFocus: string[],
): Record<ReadingLength, string> {
  const arcanaFlow = positions.map((position) => position.cardName).join(' → ')
  const recipient = getRecipientLabel(input.nickname)
  const opening = `${recipient}への今回の読みは、${spread.name}に ${arcanaFlow} が並ぶ流れになりました。`
  const keyLine = `中心には ${keyRole} の気配があり、${intentAngle[input.intent]} を軸に現実へ落としていくと読みが活きます。`
  const relationLine = input.relationTheme
    ? `${input.relationType || '関係性のテーマ'} が含まれるため、相手を断定するより自分の選び方と距離感を整える読み方が向いています。`
    : ''
  const pairLine = pairFocus[0] ?? ''
  const caution = input.reversals
    ? '逆位置も含まれているため、不安や迷いの出方も材料として扱い、必要以上に脅さずに読むのが大切です。'
    : '今回は正位置中心なので、恐れよりも流れの伸びしろを先に見ていけます。'

  return {
    short: `${opening}${keyLine}`,
    medium: `${opening}${keyLine}${relationLine}${pairLine}${caution}`,
    long: `${opening} 問いは「${input.question}」。${timeframeAngle[input.timeframe]} として読むと、いま動かせることと少し先の兆しを分けて受け取れます。${keyLine}${relationLine}${pairLine}${caution}`,
  }
}

function buildTotalComment(
  positions: ReadingPositionResult[],
  input: ReadingInput,
  keyRole: string,
) {
  const past = findPosition(positions, '過去')
  const now = findPosition(positions, '現在')
  const future = findPosition(positions, '未来')
  const method = findPosition(positions, '手段')
  const mindset = findPosition(positions, 'マインドセット')
  const fortune = findPosition(positions, '全体運勢')
  const style = intentStyle[input.intent]
  const recipient = getRecipientLabel(input.nickname)

  const analysis = [
    `${recipient}への今回の読みは、${style.analysis}`,
    past ? `過去には ${past.cardName} があり、ここまでの流れに ${past.short.replace(/。$/, '')} という背景が見えます。` : '',
    now ? `現在の中心は ${now.cardName} で、いま本当に扱うべき論点は ${now.roleLabel} として表れている点です。` : '',
    future ? `未来には ${future.cardName} が置かれ、このまま進むと ${future.short.replace(/。$/, '')} という方向が見えています。` : '',
  ]
    .filter(Boolean)
    .join('')

  const strategy = [
    method
      ? `現実を動かす手段としては ${method.cardName} が出ており、${buildIntentSpecificAction(input.intent, method, now, future)}`
      : '',
    mindset
      ? `同時に、心の置き方は ${mindset.cardName} が示す ${mindset.roleLabel} を意識するのが有効です。`
      : '',
    fortune
      ? `全体運勢の ${fortune.cardName} は、流れ全体として ${fortune.short.replace(/。$/, '')} と告げています。`
      : '',
  ]
    .filter(Boolean)
    .join('')

  const closing = `${style.action} いまは ${keyRole} の姿勢を借りるつもりで、一度に全部を変えるのではなく、次に触れる一点を明確にすると前へ進みやすくなります。${style.closing}`

  return `${analysis}${strategy}${closing}`
}

function buildIntentSpecificAction(
  intent: IntentCategory,
  method: ReadingPositionResult,
  now?: ReadingPositionResult,
  future?: ReadingPositionResult,
) {
  const baseAction = firstActionOf(method.cardNo)
  const currentAction = now ? firstActionOf(now.cardNo) : ''
  const futureAction = future ? firstActionOf(future.cardNo) : ''

  switch (intent) {
    case '恋愛':
      return `${baseAction || '会話の準備を丁寧に整える'}ことから始め、相手を詰める質問ではなく、気持ちを共有しやすい一言を先に置くのが向いています。${currentAction ? ` まずは ${currentAction}。` : ''}${futureAction ? ` その先で ${futureAction} に繋げると自然です。` : ''}`
    case '仕事':
      return `${baseAction || '優先順位を一本化する'}ことが先です。会議や作業に入る前に、今日決めることを一文で定義し、関係者が見る基準を揃えると進みます。${futureAction ? ` その後は ${futureAction} まで落とし込むと実務に変わります。` : ''}`
    case '配信活動':
      return `${baseAction || '優先順位を一本化する'}ことから始め、配信内容・見せ方・告知のうち今いちばん効く一点を決めるのが有効です。数字に振り回されるより、何を魅力として届けたいかを先に定義すると流れが安定します。${futureAction ? ` その後は ${futureAction} まで繋げると、活動全体の手応えに変わりやすいです。` : ''}`
    case '創作':
      return `${baseAction || '試作品をひとつ作る'}ことが最優先です。頭の中で完成させるより、途中でも見せられる断片を外に出すほうが流れが動きます。${futureAction ? ` 先では ${futureAction} が公開や仕上げの合図になります。` : ''}`
    case '人間関係':
      return `${baseAction || '判断基準を紙に書く'}ように、感情と境界線を分けて扱うのが有効です。伝える内容を短くして、抱え込みすぎる役割を一度軽くしてみてください。`
    case '学業':
      return `${baseAction || '優先順位を一本化する'}ことで、やる量より復習の密度を上げられます。いま伸ばすべき単元を一つ決め、確認の周期を固定すると安定します。`
    case 'メンタル':
      return `${baseAction || '生活リズムを整える'}ような、負荷を減らす実務的な一手が有効です。勢いで変えようとせず、睡眠・食事・人付き合いのどこを軽くするか一つ選ぶのが現実的です。`
    case 'その他':
      return `${baseAction || '次の一歩を24時間以内に形にする'}ことから始めると、曖昧さが少しずつ減っていきます。${currentAction ? ` いまは ${currentAction} を先に。` : ''}`
  }
}

function summarizeBackground(background: string) {
  return background.length > 42 ? `${background.slice(0, 42)}...` : background
}

function findPosition(positions: ReadingPositionResult[], label: string) {
  return positions.find((position) => position.label === label)
}

function firstActionOf(cardNo: number) {
  return cardByNo(cardNo)?.actions[0] ?? ''
}

function shuffle<T>(items: T[]) {
  const next = [...items]

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[next[index], next[swapIndex]] = [next[swapIndex], next[index]]
  }

  return next
}

export function buildReadingSnapshot(reading: ReadingResult): ReadingSnapshot {
  const past = findPosition(reading.positions, '過去')
  const now = findPosition(reading.positions, '現在')
  const future = findPosition(reading.positions, '未来')
  const method = findPosition(reading.positions, '手段')
  const mindset = findPosition(reading.positions, 'マインドセット')
  const fortune = findPosition(reading.positions, '全体運勢')
  const keyPosition =
    reading.positions.find((position) => position.cardNo === reading.keyCardNo) ?? now ?? future
  const reversedCard = reading.positions.find((position) => position.reversed)

  const headline =
    now && future
      ? `いまは ${now.cardName} が中心で、この先は ${future.cardName} へ流れが移っていく兆しです。`
      : keyPosition
        ? `今回の読みは ${keyPosition.cardName} が中心になり、そこから全体の流れを読み解く形です。`
        : '今回の読みは、いまの流れを静かに見直すための配置になっています。'

  const focus =
    method && mindset
      ? `現実を動かす軸は ${method.cardName}、心の置き方は ${mindset.cardName} にあります。行動と姿勢を分けて整えると読みが活きます。`
      : keyPosition
        ? `軸になるのは ${keyPosition.cardName} の役回りです。焦点を一つに絞るほど、次の一歩が明確になります。`
        : '軸は、いま最も重い論点をひとつに絞ることです。'

  const nextStep =
    method
      ? `今夜は ${method.cardName} に従い、${buildAdaptiveSnapshotAction(reading.input.intent, method, now, future)}。`
      : keyPosition
        ? `今夜は ${keyPosition.cardName} の方向へ寄せて、迷いを抱えたままでも一つだけ具体的な行動を置いてください。`
        : '今夜は答えを急がず、明日までに動ける一つの行動だけを静かに決めてください。'

  const caution = reversedCard
    ? `気をつけたいのは ${reversedCard.cardName} の影の出方です。不安や思い込みが膨らむ時ほど、事実と感情を分けて扱うと落ち着きます。`
    : fortune
      ? `${fortune.cardName} が全体運勢を包んでいるので、大きく振り回されるより流れを素直に受け取ると安定しやすい配置です。`
      : past
        ? `過去の ${past.cardName} に引っ張られすぎず、今の判断材料を見直すのが大切です。`
        : '焦って結論を出すより、いま見えている流れを順番に確かめるのが向いています。'

  const historyLine = keyPosition
    ? `${reading.input.intent} / Key: ${keyPosition.cardName} / ${nextStep}`
    : `${reading.input.intent} / ${nextStep}`

  return {
    headline,
    focus,
    nextStep,
    caution,
    historyLine,
  }
}

function cardByNo(cardNo: number): CardDefinition | undefined {
  return cards.find((card) => card.no === cardNo)
}

function buildAdaptiveSnapshotAction(
  intent: IntentCategory,
  method: ReadingPositionResult,
  now?: ReadingPositionResult,
  future?: ReadingPositionResult,
) {
  const methodAction = firstActionOf(method.cardNo) || '次の一歩を小さく具体化する'
  const currentCue = now ? firstActionOf(now.cardNo) : ''
  const futureCue = future ? firstActionOf(future.cardNo) : ''
  const methodRole = method.roleLabel || method.cardName
  const methodMotif = method.motif || method.short
  const currentRole = now?.roleLabel || now?.cardName || 'いま強く出ている流れ'
  const futureRole = future?.roleLabel || future?.cardName || '次にひらく兆し'
  const futureCard = future?.cardName || 'この先の流れ'
  const practicalHook = currentCue || futureCue || methodMotif

  switch (intent) {
    case '仕事':
      return `${method.cardName}が示す${methodRole}を軸に、${methodAction}ことを最優先にしてください。${futureCard}へ流れをつなぐには、${practicalHook}を形にする作業を一つに絞り、着手の順番まで今のうちに決めておくのが有効です。`
    case '恋愛':
      return `${method.cardName}が示す${methodRole}を意識し、${methodAction}ことから気持ちを整えてください。${futureCard}へ向かう流れを穏やかに育てるには、答えを急ぐよりも、${methodMotif}が伝わる言葉を一つだけ準備しておくほうが関係を動かしやすくなります。`
    case '人間関係':
      return `${method.cardName}が示す${methodRole}に沿って、${methodAction}ことを対人の軸に置いてください。${currentRole}が濃い今は、相手に合わせすぎるより、距離を縮めるか守るかを一度だけはっきり決めるほうが流れを安定させます。`
    case '配信活動':
      return `${method.cardName}が示す${methodRole}を前面に出し、${methodAction}ことを次の配信準備に落とし込んでください。${futureCard}へ伸ばすには、${methodMotif}が見える見せ場を一つ作り、企画・話し方・導線のどこで光らせるかまで決めると動きやすくなります。`
    case '創作':
      return `${method.cardName}が示す${methodRole}を信じて、${methodAction}ことを制作の入口にしてください。完成度を一気に求めるより、${methodMotif}が伝わる最小単位をまず外に出せる形にすると、${futureRole}へつながる流れが具体化しやすくなります。`
    case '学業':
      return `${method.cardName}が示す${methodRole}を頼りに、${methodAction}ことを学びの中心に据えてください。今は量を広げるよりも、${practicalHook}に関わる範囲を一つだけ区切って、いつ取りかかるかまで決めるほうが理解と手応えを得やすくなります。`
    case 'メンタル':
      return `${method.cardName}が示す${methodRole}を守るつもりで、${methodAction}ことを心の整え方に置いてください。無理に前向きになるより、${methodMotif}を壊さない範囲で負荷を下げる行動を一つ選ぶほうが、結果として${futureCard}へ向かう流れを立て直しやすくなります。`
    case 'その他':
      return `${method.cardName}が示す${methodRole}を手がかりに、${methodAction}ことから始めてください。いまは大きな結論よりも、${practicalHook}に触れる小さな行動を一つ置くことで、${futureRole}へ向かう流れが実感しやすくなります。`
  }
}

void buildSnapshotAction

function buildSnapshotAction(
  intent: IntentCategory,
  method: ReadingPositionResult,
  now?: ReadingPositionResult,
  future?: ReadingPositionResult,
) {
  const methodAction = firstActionOf(method.cardNo) || '次の一歩を小さく具体化する'
  const currentCue = now ? firstActionOf(now.cardNo) : ''
  const futureCue = future ? firstActionOf(future.cardNo) : ''

  switch (intent) {
    case '恋愛':
      return `${methodAction}ことを優先し、気持ちは決めきらなくても相手に伝える言葉を一つだけ準備してください`
    case '仕事':
      return `${methodAction}ことに集中し、明日すぐ着手する作業を一つに絞って順番を決めてください`
    case '人間関係':
      return `${methodAction}ことを軸に、距離を縮めるか守るかを一つだけ選んで言葉にしてください`
    case '配信活動':
      return `${methodAction}ことから始め、次の配信で試す見せ方を一つだけ決めてください`
    case '創作':
      return `${methodAction}ことを優先し、完成度より公開できる最小単位を今夜のうちに決めてください`
    case '学業':
      return `${methodAction}ことを起点に、次に学ぶ範囲を一つだけ区切って着手時間まで決めてください`
    case 'メンタル':
      return `${methodAction}ことを大切にし、無理に前向きにならず負荷を下げる行動を一つ選んでください`
    case 'その他':
      return `${methodAction}ことから始め、${currentCue || futureCue || '今夜いちばん重い論点'}に対して動ける小さな行動を一つだけ置いてください`
  }
}
