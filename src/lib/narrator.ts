import type { ReadingLength } from '../data/tarot'
import type {
  NarratorMode,
  ReadingPositionResult,
} from './readingEngine'

type NarratorTextKind = 'position' | 'summary'

export const geoSummaryIntroVariants = [
  '俺が来たからには、今夜の札も中央突破で読むぞ。……怖くはない、ちょっと慎重なだけだ。',
  'よし、ここからが主役の出番だ。お前の六芒、俺が気合で見切る。',
  'ビビってる場合じゃないな。いや俺はビビってない、札がちょっと迫力あるだけだ。',
  '任せろ。気合と根性で、この流れのど真ん中をぶち抜いて読む。',
  '今夜の札、なかなか手強い顔をしてるな。だが俺は退かない、たぶん。',
  'ここが勝負所だ。最後の一回でひっくり返すつもりで読んでいくぞ。',
  '俺の出番だな。怖そうな札でも、ちゃんと見れば道はある。',
  'よし、腹を括れ。俺も括る。……いや、先にお前が括ってくれ。',
  'この配列、ただ者じゃないな。だが俺もただ者じゃない。',
  'いいか、運命ってやつは気合で押すと意外と動く。たぶん動く。',
  '今夜の六芒、正面から読むぞ。横道に逃げない、俺も逃げない。',
  '札が何を言ってようと、最後に動くのはお前だ。そこを俺が照らす。',
  'さあ来た、運命の読み取りタイムだ。怖くないぞ、ちょっと心拍数が上がっただけだ。',
  '俺ならこう見る。迷いは敵じゃない、ラスボス前の演出だ。',
  'この札回り、熱いな。いや熱すぎるな。少しだけ距離を取って読むぞ。',
  '根性論だけで全部いけるとは言わない。だが最初の一歩には効く。',
  'よし、札の声を聞くぞ。聞こえすぎたら一回深呼吸だ。',
  'お前の今夜の流れ、俺が主役っぽく読み解く。演出は任せろ。',
  '怖い札ほど、ちゃんと見たら味方になる。俺も今それを信じてる。',
  'ここから先は中央突破だ。迷いの壁に、俺とお前で風穴を開ける。',
  'よし、ここからは気合の本番だ。札が重くても、読む手は止めないぞ。',
  '俺に任せろ。ちょっと足はすくむが、心までは折れない。',
  'この並び、なかなかの圧だな。だが圧に負ける俺じゃない。たぶん今日は。',
  'いい札も荒れる札も、まとめて受けて立つ。読むなら今だ。',
  '俺は逃げ腰じゃない、低姿勢なだけだ。さあ、今夜の流れを見ていくぞ。',
  '六芒の空気がピリついてるな……だがこういう時こそ、主役の踏ん張りどころだ。',
  '大丈夫、まだ慌てる時間じゃない。まずは札の本音を、一枚ずつ正面から拾っていく。',
  'ここでひるんだら格好がつかないからな。いや、格好抜きでもちゃんと読むぞ。',
  '今夜の札、クセが強そうで燃えるな。燃えるけど、ちょっとだけ腰は引けてる。',
  'よし、一歩も引かずに読む。……半歩くらいのけぞってたら、それは演出だ。',
] as const

export const geoSummaryClosingVariants = [
  '最後の一回で流れは変わる。だから今日は、ひとつだけ前に出ろ。',
  'ビビってもいい。止まらなければ、それはもう根性だ。',
  'ここで退かないやつに、札はちゃんと道を残す。',
  '大丈夫だ、勝ち筋は消えてない。ちょっと影に隠れてるだけだ。',
  '迷いはある。でも主役はお前だ。そこだけ忘れるな。',
  '怖いなら小さく行け。小さい一歩も、立派な中央突破だ。',
  '今日は全部を倒さなくていい。まず一体、いや一件だけ片づけろ。',
  '札だけに、さっと動け。……今のは忘れていい、でも動くのは忘れるな。',
  '根性は叫ぶものじゃない。最後にもう一回だけ手を伸ばすことだ。',
  '俺も少し震えてる。だがそれは武者震いだ。お前もそういうことにしよう。',
  '今夜は逃げ切りじゃない。立て直しの一手で勝ちに行く。',
  '運命は派手に変えなくていい。まず今日の選び方を変えろ。',
  'ここで一歩出たら、明日の自分がちょっと強くなる。',
  '不安が来たら言ってやれ。今は俺のターンだ、とな。',
  '最後の一回を残してるやつは強い。お前にもまだそれがある。',
  '急がなくていい。ただし、諦めるのはまだ早い。',
  '迷ったら真正面だ。遠回りに見えても、心が決めた一歩は強い。',
  '今日はここまで読めたなら勝ちだ。次は一個だけ現実で動かせ。',
  '影が濃い夜ほど、火は目立つ。小さくても灯していけ。',
  'よし、これで作戦会議は終わりだ。あとはお前が一手、決めてこい。',
  '勝負はまだ終わってない。今日は小さくても、一手打てば十分だ。',
  'ビビる心があってもいい。その上で進むやつが、最後に強い。',
  '札の答えは出た。あとはお前が、現実で一歩を置くだけだ。',
  '派手な逆転はいらない。今日は崩れない一手を選べ、それで強い。',
  '迷いが残っても構わない。主役ってのは、迷いごと前に出るもんだ。',
  '今夜は無茶をする日じゃない。だが、何もしない日でもない。',
  '一気に決めなくていい。じわっと前に出る、それも立派な勝ち方だ。',
  '札は厳しくても、道まで消してはいない。細くても、進める道はある。',
  '今日の読みが刺さったなら、それが合図だ。ひとつ動いて、流れを変えろ。',
  'よし、ここから先は実戦だ。気合入れていけ。……無理はするな、でも前は向け。',
] as const

const geoShortClosings = [
  'ここは気合で一歩だ。',
  'ビビるな、俺もいる。',
  '最後の一回で流れを変えるぞ。',
  '札だけに、さっと動ける。',
] as const

export function narrateText(
  text: string,
  mode: NarratorMode = 'classic',
  seedKey = '',
  kind: NarratorTextKind = 'summary',
) {
  const trimmed = text.trim()

  if (mode === 'classic' || !trimmed) {
    return trimmed
  }

  if (kind === 'position') {
    const closing = pickBySeed(geoShortClosings, `${seedKey}:closing`)
    return `${shapeGeoVoice(trimmed)}${closing}`
  }

  const intro = pickBySeed(geoSummaryIntroVariants, `${seedKey}:intro`)
  const closing = pickBySeed(geoSummaryClosingVariants, `${seedKey}:closing`)

  // Summary keeps the generated middle body untouched; only intro and closing vary.
  return `${intro}${trimmed}${closing}`
}

export function narratePositionResult(
  position: ReadingPositionResult,
  mode: NarratorMode = 'classic',
  seedKey = '',
): ReadingPositionResult {
  if (mode === 'classic') {
    return position
  }

  const lengths: ReadingLength[] = ['short', 'medium', 'long']
  const narratedBodies = Object.fromEntries(
    lengths.map((length) => [
      length,
      narrateText(position.generated[length].body, mode, `${seedKey}:${position.label}:${length}`, 'position'),
    ]),
  ) as Record<ReadingLength, string>

  return {
    ...position,
    short: narratedBodies.short,
    medium: narratedBodies.medium,
    long: narratedBodies.long,
    generated: {
      short: {
        ...position.generated.short,
        body: narratedBodies.short,
      },
      medium: {
        ...position.generated.medium,
        body: narratedBodies.medium,
      },
      long: {
        ...position.generated.long,
        body: narratedBodies.long,
      },
    },
  }
}

export function narrateSummary(
  summary: Record<ReadingLength, string>,
  mode: NarratorMode = 'classic',
  seedKey = '',
) {
  if (mode === 'classic') {
    return summary
  }

  return {
    short: narrateText(summary.short, mode, `${seedKey}:short`, 'summary'),
    medium: narrateText(summary.medium, mode, `${seedKey}:medium`, 'summary'),
    long: narrateText(summary.long, mode, `${seedKey}:long`, 'summary'),
  }
}

function pickBySeed(items: readonly string[], seedKey: string) {
  return items[hashString(seedKey) % items.length]
}

function shapeGeoVoice(text: string) {
  return text
    .replace(/してみてください/g, 'してみてくれ')
    .replace(/してください/g, 'してくれ')
    .replace(/ください/g, 'くれ')
    .replace(/よいでしょう。/g, 'いいだろ。')
    .replace(/でしょう。/g, 'だろ。')
    .replace(/かもしれません。/g, 'かもしれない。いや、ビビって言ってるわけじゃない。')
    .replace(/です。/g, 'だ。')
    .replace(/ます。/g, 'る。')
    .replace(/です/g, 'だ')
    .replace(/ます/g, 'る')
    .replace(/不安/g, 'ちょっと怖いところ')
    .replace(/迷い/g, '迷い、つまりラスボス前の足踏み')
}

function hashString(value: string) {
  let hash = 2166136261

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return hash >>> 0
}
