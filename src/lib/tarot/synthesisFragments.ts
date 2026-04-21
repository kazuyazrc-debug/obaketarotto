import type {
  IntentCategory,
  ReadingLength,
  TimeframeOption,
} from '../../data/tarot'
import type { Tone } from './types'

export type SynthesisSlot =
  | 'totalComment.opener'
  | 'totalComment.pastBridge'
  | 'totalComment.presentBridge'
  | 'totalComment.futureBridge'
  | 'totalComment.methodPhrase'
  | 'totalComment.mindsetPhrase'
  | 'totalComment.fortunePhrase'
  | 'totalComment.relationBridge'
  | 'totalComment.backgroundBridge'
  | 'totalComment.pairBridge'
  | 'totalComment.closing'
  | 'snapshot.headlineOpener'
  | 'snapshot.focusLead'
  | 'snapshot.nextStepLead'
  | 'snapshot.cautionLead'
  | 'snapshot.historyLineFormat'
  | 'summary.opener'
  | 'summary.bridge'
  | 'summary.closing'
  | 'intentClosing'
  | 'intentAngle'
  | 'timeframeAngle'

export type SynthesisFragment = {
  id: string
  slot: SynthesisSlot
  text: string
  tones?: Tone[]
  lengths?: ReadingLength[]
  position?: 'upright' | 'reversed' | 'any'
  intents?: IntentCategory[]
  timeframes?: TimeframeOption[]
  tags?: string[]
}

function createFragment(
  id: string,
  slot: SynthesisSlot,
  text: string,
  options: Omit<SynthesisFragment, 'id' | 'slot' | 'text'> = {},
): SynthesisFragment {
  return {
    id,
    slot,
    text,
    ...options,
  }
}

function createSeries(
  slot: SynthesisSlot,
  prefix: string,
  texts: string[],
  options: Omit<SynthesisFragment, 'id' | 'slot' | 'text'> = {},
): SynthesisFragment[] {
  return texts.map((text, index) =>
    createFragment(`${prefix}-${String(index + 1).padStart(2, '0')}`, slot, text, options),
  )
}

function createScopedSeries<K extends string>(
  slot: SynthesisSlot,
  prefix: string,
  values: Record<K, string[]>,
  buildOptions: (key: K) => Omit<SynthesisFragment, 'id' | 'slot' | 'text'>,
): SynthesisFragment[] {
  return (Object.keys(values) as K[]).flatMap((key) =>
    values[key].map((text, index) =>
      createFragment(
        `${prefix}-${key}-${String(index + 1).padStart(2, '0')}`,
        slot,
        text,
        buildOptions(key),
      ),
    ),
  )
}

const totalCommentOpeners = createSeries('totalComment.opener', 'total-comment-opener', [
  '今夜の流れを静かに辿ると、まず鍵札の {keyCardName} が月明かりの中心に立つ夜',
  '六芒の輪郭を順に読むと、今回の読みは {keyCardName} を軸にして淡い霧をほどく構図',
  '{recipient}へ向いた今夜の星図では、最初に {keyCardName} が古い手紙の封のような役目を担います',
  '札の並びをひと息で見渡すと、読みの芯には {keyCardName} が置かれ、他の札の囁きをひとつに束ねます',
  'ろうそくの火をひとつ灯すように見ていくと、今回いちばん強く輪郭を持つのは {keyCardName} の気配です',
  '今夜の六芒は静けさの強い配列で、その中央にいる {keyCardName} が物語のはじまりを受け持つでしょう',
  '{recipient}の問いに寄り添う札を重ねると、最初の扉を開ける役目は {keyCardName} が担います',
  'この読みは派手に結論を押し出すより、{keyCardName} が照らす一点から全体を読み広げる夜',
  '札どうしの距離を見比べると、今夜は {keyCardName} が水面の反射のように他の意味を映し返すかもしれません',
  '今回の星図では、最初に耳を澄ませたい声として {keyCardName} が静かに前へ出ています',
  '{recipient}の問いは六つの面に分かれましたが、その全体を結ぶ糸は {keyCardName} の側です',
  '今夜の読みは、影を怖がるより輪郭を確かめるためにあり、その先頭に立つ札は {keyCardName} です',
])

const totalCommentPastBridges = createSeries('totalComment.pastBridge', 'total-comment-past', [
  '過去に立つ {pastCardName} は、{excerpt} という余韻をまだ静かに引いています',
  'ここまでの流れを振り返ると、{pastCardName} が残した {excerpt} という手触りは今も土台です',
  '背後にある影響としては {pastCardName} が濃く、{excerpt} という形で今夜の判断へつながる背景',
  '過去の位置にある {pastCardName} は、{excerpt} と告げながら現在の輪郭を先に整えてきました',
  '振り返るべき起点は {pastCardName} にあり、{excerpt} という流れがまだ薄く消えずに残る余熱',
  '{pastCardName} が過去側に置かれたことで、{excerpt} という背景が今回の読みの底に沈んでいます',
  '過去札の {pastCardName} は、{excerpt} と示しながら今夜の迷いがどこから来たかを照らします',
  'これまでの積み重ねを見るなら、{pastCardName} が語る {excerpt} がいまの選び方の癖になっています',
  '先に通ってきた場面では {pastCardName} が働いており、{excerpt} という気配はまだ抜けません',
  '読みの背面にある古い風景として、{pastCardName} が {excerpt} という静かな説明',
])

const totalCommentPresentBridges = createSeries(
  'totalComment.presentBridge',
  'total-comment-present',
  [
    '現在の中心には {nowCardName} があり、{excerpt} という課題がいま最も濃く見えています',
    'いま強く出ている札は {nowCardName} で、{excerpt} という輪郭が今夜の入口',
    '現在位置の {nowCardName} は、{excerpt} と囁きながら今の迷いをひとつの面へ集めます',
    '現時点でいちばん響いているのは {nowCardName} の示唆で、{excerpt} が今回の核心です',
    '今夜の足元を照らしているのは {nowCardName} で、{excerpt} という状態を先に見つめる必要があります',
    '現在札の {nowCardName} は、{excerpt} という流れを通していま何が濃いのかを明確にしています',
    '問いをいまの地点へ戻すと、{nowCardName} が {excerpt} と伝えながら判断軸を整える局面',
    '最も手触りの強い面は {nowCardName} にあり、{excerpt} が今回の読みの入口として立っています',
    '{nowCardName} が現在に現れたことで、{excerpt} という論点が逃げずに見える配置です',
    '今夜の輪郭を決めているのは {nowCardName} で、{excerpt} をどう扱うかが読後の差になるでしょう',
  ],
)

const totalCommentFutureBridges = createSeries(
  'totalComment.futureBridge',
  'total-comment-future',
  [
    '未来の位置では {futureCardName} が、{excerpt} という兆しを先に置く輪郭',
    'このまま進んだ先には {futureCardName} が控えており、{excerpt} という流れが育ちやすくなっています',
    '近い先を読むと、{futureCardName} が {excerpt} と告げながら次章の輪郭を細く描く線',
    '未来札の {futureCardName} は、{excerpt} という兆候を通して今夜の選び方の先を見せます',
    'これから先に強まりやすいのは {futureCardName} の気配で、{excerpt} がゆっくり表に出てくるでしょう',
    '未来側に置かれた {futureCardName} は、{excerpt} という景色を迎える準備を促しています',
    '{futureCardName} が未来に立つことで、{excerpt} という流れが次の段へ続く道筋',
    '今夜の先にある面として {futureCardName} が見えており、{excerpt} をどう迎えるかが鍵になります',
    'これからの兆しは {futureCardName} に宿り、{excerpt} という変化が淡く広がろうとしています',
    '未来札の声を拾うなら、{futureCardName} は {excerpt} と伝えながら行き先の癖を先に明かす予感',
  ],
)

const totalCommentMethodPhrases = createSeries(
  'totalComment.methodPhrase',
  'total-comment-method',
  [
    '動かし方としては {methodCardName} に倣い、{excerpt2} を今夜の具体策へ落とすのが自然です',
    '手段の位置にいる {methodCardName} は、{excerpt2} という進め方を現実側へ渡しています',
    '今夜ひとつ行動へ移すなら、{methodCardName} が示す {excerpt2} を小さく試す段取り',
    '{methodCardName} は手段札として、{excerpt2} をそのまま次の一歩の形へ変える役目を持っています',
    '状況を動かす鍵は {methodCardName} にあり、{excerpt2} を行動の順番に変えると読みが活きます',
    '具体策を選ぶ場面では {methodCardName} が前へ出て、{excerpt2} という手つきを勧めています',
    '手段札の {methodCardName} は、{excerpt2} を静かな実務へ変えるための手つき',
    'もし今夜すぐ扱えることを選ぶなら、{methodCardName} の {excerpt2} から始めると無理がありません',
    '{methodCardName} が手段にある夜は、{excerpt2} を一つだけ現実に置くことが流れをつかみます',
    '動き出しの糸口として、{methodCardName} は {excerpt2} という作法を丁寧に差し出しています',
  ],
)

const totalCommentMindsetPhrases = createSeries(
  'totalComment.mindsetPhrase',
  'total-comment-mindset',
  [
    '心の置き方は {mindsetCardName} に寄せるのがよく、{excerpt2} という姿勢が今夜の負荷を軽くします',
    '内側の持ち方としては {mindsetCardName} が示す {excerpt2} を先に受け取ると揺れが整います',
    '{mindsetCardName} は心の面で、{excerpt2} という静かな構え',
    '感情の扱い方では {mindsetCardName} が鍵になり、{excerpt2} を意識すると流れに飲まれにくくなります',
    'いま無理なく保ちたい姿勢は {mindsetCardName} 側にあり、{excerpt2} がその軸になります',
    '心をどこへ置くか迷うなら、{mindsetCardName} が渡す {excerpt2} を先に確かめるとよい夜です',
    '{mindsetCardName} はマインドセット札として、{excerpt2} という内側の整え方を示しています',
    '内面を荒らさず進むために、{mindsetCardName} の {excerpt2} をひとつの目安にしてみてください',
    '心の面に現れた {mindsetCardName} は、{excerpt2} を通して静けさを守る順番',
    'いま必要なのは勢いよりも {mindsetCardName} の視点で、{excerpt2} が読みを受け止めやすくします',
  ],
)

const totalCommentFortunePhrases = createSeries(
  'totalComment.fortunePhrase',
  'total-comment-fortune',
  [
    '全体運勢の位置では {fortuneCardName} が、{excerpt3} という大きな気流を作る夜',
    '読み全体を包む空気としては {fortuneCardName} が濃く、{excerpt3} が今夜の背景音です',
    '{fortuneCardName} は全体運勢として、{excerpt3} という広い流れをゆっくり照らします',
    '六芒の外縁を包んでいるのは {fortuneCardName} で、{excerpt3} が全体の運び方を示しています',
    '全体の空模様を見るなら {fortuneCardName} が鍵で、{excerpt3} という運気の癖が見えてきます',
    '今夜の大きな流れは {fortuneCardName} 側にあり、{excerpt3} が全体のリズムを決めるでしょう',
    '{fortuneCardName} が全体運勢に立つ夜は、{excerpt3} という気配が全札へ静かに染み込む気流',
    '読みの上空を流れる風として、{fortuneCardName} が {excerpt3} と告げています',
    '全体運勢札の {fortuneCardName} は、{excerpt3} という形で今夜の進み方を包み直します',
    '最後に全体を見上げると、{fortuneCardName} が {excerpt3} という大きめの方向を残す余韻',
  ],
)

const totalCommentRelationBridges = createSeries(
  'totalComment.relationBridge',
  'total-comment-relation',
  [
    '今回の問いには相手の存在がにじむぶん、誰かを断定するより {recipient} の感じ方の輪郭を先に守るほうが読みは安定します',
    '関係性が主題に入る夜は、相手の心を当てにいくより {recipient} がどこで揺れたかを見つけるほうが役に立ちます',
    '関係の話題を含む今回は、距離の取り方を整えるだけでも札の意味がかなり現実へ落ちます',
    '相手とのことを考えるほど霧が深くなる時は、まず {recipient} 側の本音と反応を切り分ける読み方が向いています',
    '関係性の札読みでは、誰が正しいかよりも、どの場面で心が硬くなるかを確かめるほうが道筋が見えます',
    '相手を理解しようとする気持ちは大切ですが、今夜は {recipient} 自身の境界線を先に描くことが土台になります',
    '関わりの論点が含まれるからこそ、相手の動きを追うより自分の受け取り方を整えるほうが静かに効いてきます',
    '人と人の読みでは、気持ちの正誤より距離感の調律が大切で、その視点が今夜の札とよく噛み合っています',
  ],
)

const totalCommentBackgroundBridges = createSeries(
  'totalComment.backgroundBridge',
  'total-comment-background',
  [
    '背景に置かれた言葉があるぶん、今回の札は抽象だけではなく実際の重さを抱えたまま並んでいます',
    '書いてくれた経緯があるからこそ、今夜の読みは淡い印象論ではなく、具体的な輪郭へ寄っていけます',
    '背景の文脈は古い手紙の余白のように効いており、各札の示唆に静かな厚みを足しています',
    '今回の背景は、札の意味を急に狭めるのでなく、どこに重心があるかを教える補助線になっています',
    '書かれた状況があることで、六芒の読みは夜空ではなく実際の机の上へ降りてきやすくなっています',
    '背景に触れられているぶん、今夜の札はぼんやりした慰めではなく、現実の温度を含んだ読みになっています',
    '置いてくれた文脈があるため、各札の囁きは同じ言葉でも別の深さを持って響いています',
    '今回の背景は、何に先に手を当てるべきかを見極めるための静かな印になっています',
  ],
)

const totalCommentPairBridges = createSeries('totalComment.pairBridge', 'total-comment-pair', [
  '{pairFocus} その重なりは、今夜の読みが一つの性質を繰り返し確かめている証でもあります',
  '{pairFocus} 同じ手触りが別の位置に現れているため、偶然よりも今の主題として受け取る価値があります',
  '{pairFocus} 役目の反復が起きている夜は、目立つ札だけでなく繰り返しそのものが意味になります',
  '{pairFocus} 同じ性質の札が複数面で響くときは、読み全体に通底する習慣や癖が浮かびやすくなります',
  '{pairFocus} その重なりは、表面の論点より根に近い場所を見てほしいという合図です',
  '{pairFocus} 似た役目が続く配列は、今夜のテーマが一点でなく複数の場面へ広がっていることを示します',
  '{pairFocus} 同じ響きが別の位置に宿ることで、読みは単発の出来事より継続する流れとして見えてきます',
  '{pairFocus} 重なりのある夜は、その札の美点も偏りも両方が強まりやすいので丁寧に受け取るとよいです',
])

const totalCommentClosings = createSeries('totalComment.closing', 'total-comment-closing', [
  '焦って大きく動くより、今夜は輪郭が見えた一か所にだけ静かに手を入れるほうが次章は開きやすくなります',
  '結論を急ぐより、いま見えた札の順番を守ることが、今回の読みを現実へ落とすいちばん確かな道です',
  '今夜の示唆は派手さより整え方に宿るため、ひとつ選んで小さく実行するだけでも流れは十分に変わります',
  '読みを生かす鍵は勇ましさではなく順番にあり、まず心と行動を切り分けるところから始めると迷いが薄れます',
  '今夜は答えを言い切る夜というより、次に触れるべき一点を静かに定める夜だと受け取ると無理がありません',
  '札はすべてを急げとは告げておらず、いま見えた輪郭から先に整えれば十分だと穏やかに伝えています',
  'ひとつの正解を掴みにいくより、今夜の配列が指した順番を守るほうが読みの手触りを失わずに進めます',
  '今夜の流れは、静けさの中で軸を合わせるほど味方になりやすく、焦りはその輪郭を曇らせやすいです',
  '必要なのは全部を変えることではなく、先に見えた一点を丁寧に扱うことで、残りの霧はあとから薄くなります',
  '札は強い断定よりも、いま触れるべき面をやさしく示しています。その一面に応えるだけでも十分な前進です',
  '今夜は答えを増やすより、選ぶ数を減らすほうが読みが実際の行動へつながっていきます',
  '読みの余韻を残したまま眠れるくらいの静かな一歩が、今回の配列にはちょうどよい重さです',
])

const snapshotHeadlineOpeners = createSeries(
  'snapshot.headlineOpener',
  'snapshot-headline',
  [
    'いま星図の中心に立つのは {keyCardName} で、今夜の読みを静かに束ねる夜',
    '今回の鍵札は {keyCardName} で、読み全体の輪郭をいちばん濃く引く一点',
    '{keyCardName} が中心にある夜で、そこから他の札の声がゆっくり広がるでしょう',
    '今夜は {keyCardName} が主役となり、問いの重心をひとつに定めます',
    '{keyCardName} が前に出たことで、今回の読みは静かながら筋の通った流れになりました',
    'いま最も目を向けたい札は {keyCardName} で、全体の意味をそこから読みほどけます',
    '今回の配列では {keyCardName} が要となり、迷いの輪郭を一段はっきりさせています',
    '{keyCardName} の気配が今夜の中心を占め、他の札がその周りで意味を結び直す構図',
    'いまは {keyCardName} が先に語る夜で、その示唆が全体の入口です',
    '六芒を見渡した時、真っ先に受け取りたいのは {keyCardName} が照らす一点です',
  ],
)

const snapshotFocusLeads = createSeries('snapshot.focusLead', 'snapshot-focus', [
  'まず整えるなら {methodCardName} と {mindsetCardName} の二面を一緒に読むと、行動と心の置き方が噛み合います',
  '今夜の焦点は、{methodCardName} が示す動き方と {mindsetCardName} が求める心の温度差にあります',
  '手をつける順番としては、{methodCardName} の具体策を拾いながら {mindsetCardName} の姿勢で受け止める形が合っています',
  '焦点をしぼるなら、{methodCardName} の現実策と {mindsetCardName} の内面調律を対で見ると読みやすくなります',
  'いま見るべき面は、{methodCardName} が渡す行動と {mindsetCardName} が守る静けさです',
  '今回の読みでは、{methodCardName} の一歩と {mindsetCardName} の構えが同時に鍵になっています',
  '六芒の中でとくに効くのは、{methodCardName} のやり方と {mindsetCardName} の保ち方の組み合わせです',
  '焦点はひとつではなく、{methodCardName} が示す実際の手つきと {mindsetCardName} の受け止め方に分かれています',
  '今夜の要点を短く言えば、{methodCardName} の実行線と {mindsetCardName} の内面線をずらさないことです',
  'まず読む軸として、{methodCardName} と {mindsetCardName} の二札を並べると全体の理解が早まります',
])

const snapshotNextStepLeads = createSeries('snapshot.nextStepLead', 'snapshot-next-step', [
  '次の一歩は、今夜のうちにひとつだけ手をつける対象を決め、その輪郭を曖昧にしないことです',
  '最初の行動としては、大きく変えるより、いちばん濃く出た札の示唆をひとつ現実に置くのが向いています',
  '今夜の次手は、迷いを増やすことではなく、札が示した順番の一番手前から静かに着手することです',
  'まずやるなら、感情と行動を分けて書き出し、そのうえで一か所だけ整えると流れが動きやすくなります',
  '次に進むためには、いま見えた論点を一つの文へまとめてから動くほうが読みと行動がずれません',
  '今夜は勢いを足すより、先に触る一点を決めることがそのまま前進になります',
  '一歩目として合うのは、札が強く照らした面を今日中に小さく試すことです',
  '今夜の行動は多さではなく精度が大切で、ひとつ定めて静かに着手するだけでも十分です',
  '次章を開くなら、いま曖昧なまま残っている一点に名前をつけ、それに沿って動くのが自然です',
  'まずは読むだけで終えず、札が示した順番の最初の段を現実へ移すことが勧められています',
])

const snapshotCautionLeads = createSeries('snapshot.cautionLead', 'snapshot-caution', [
  '気をつけたいのは、見えた示唆を一度に全部こなそうとして輪郭をぼかしてしまうことです',
  '注意点は、焦りが先に立つことで札の順番を飛ばし、必要な整えを見落とす流れです',
  '今夜の読みでは、感情の勢いだけで判断すると本来の示唆が濁りやすい点に気を配りたいです',
  '避けたいのは、ひとつの札だけを拡大して読み、他の面が示した補助線を消してしまうことです',
  '気をつけるなら、答えを急ぐあまり、まだ確かめる段階のことまで断定してしまう流れです',
  '今夜の注意は、霧の中で結論だけを急ぎ、整えるべき順番を飛ばしてしまうことにあります',
  '避けたいのは、読みを気分の慰めだけで終わらせて、具体的な一歩に変え損ねることです',
  'とくに気をつけたいのは、いま濃く出た論点から目をそらして別の話題へ逃げることです',
  '注意点としては、見えた違和感を小さく扱いすぎて、同じ揺れを持ち越す流れが挙げられます',
  '読みを活かすためには、焦りと想像を混ぜて大きな結論へ飛ばないことが大切です',
])

const snapshotHistoryFormats = createSeries(
  'snapshot.historyLineFormat',
  'snapshot-history',
  [
    '{intent} / {timeframe} / 鍵札 {keyCardName} / {excerpt}',
    '{timeframe}の{intent} / 中心 {keyCardName} / {excerpt}',
    '{intent} / 六芒 / {keyCardName} / {excerpt}',
    '{intent} / 焦点 {keyCardName} / {timeframe} / {excerpt}',
    '{timeframe} / 鍵札 {keyCardName} / {intent} / {excerpt}',
    '{intent} / {keyCardName} / {excerpt} / {timeframe}',
  ],
)

const summaryOpeners = [
  ...createSeries(
    'summary.opener',
    'summary-opener-short',
    [
      '{recipient}の今夜の読みは、{keyCardName} を中心にひとつの流れへまとまりました',
      '今回の六芒では {keyCardName} が先頭に立ち、読みの方向を静かに定める夜',
      '{keyCardName} が鍵札に立ったことで、今夜の問いは輪郭のある流れとして見えています',
      '今夜の読みは {keyCardName} を軸に、必要な面だけを照らす形になりました',
      '{recipient}へ届いた今回の配列は、{keyCardName} から全体を読みほどく入口です',
      '今回の要点は {keyCardName} が握っており、他の札はその補助線として働きます',
      '今夜の星図では {keyCardName} が中心となり、問いの重さをひとつに束ねています',
      '{keyCardName} が主役の夜で、そこから過去と未来の意味がつながるでしょう',
      '読みの入口として最も濃いのは {keyCardName} で、今夜の軸をここに置けます',
      '{recipient}の今回の六芒は、{keyCardName} の気配を中心に静かに整う配列',
    ],
    { lengths: ['short'] },
  ),
  ...createSeries(
    'summary.opener',
    'summary-opener-medium',
    [
      '{recipient}の今夜の六芒は、{keyCardName} を芯にしながら各札が同じ方向へ意味を寄せる構図',
      '今回の読みは {keyCardName} から始まり、過去と現在と未来がひとつの細い道へつながっています',
      '{keyCardName} が鍵になる配列で、今夜は複数の札が同じ論点を別の角度から照らします',
      '今回の星図では {keyCardName} がいちばん濃く立ち、他の面がそれぞれ静かに支えるでしょう',
      '{recipient}の問いに対しては、{keyCardName} が中心に座り、六つの面を一つの流れへ結び直します',
      '今夜の読みは {keyCardName} から広がる形で、気持ちと行動の両方を同時に見つめる配置になりました',
      '{keyCardName} が主軸となることで、今回の六芒は単発の出来事よりも全体の順番を示す読みになります',
      '今回の配列では {keyCardName} が先に語り、残りの札がその意味を過去から未来へ運んでいます',
      '今夜の六芒は {keyCardName} の示唆を中心にしながら、具体策と心の置き方まで丁寧に分かれる配列',
      '{recipient}への読みは、{keyCardName} の気配を核として、各位置の札が静かに応答するかたちです',
    ],
    { lengths: ['medium'] },
  ),
  ...createSeries(
    'summary.opener',
    'summary-opener-long',
    [
      '{recipient}の今夜の読みは、{keyCardName} を核にしながら、過去から未来までが一枚の古い手紙のようにつながる配列になりました',
      '今回の六芒は {keyCardName} が中心に立ち、他の札がその周囲で気持ちと行動と運気の面を静かに分担する構図',
      '{keyCardName} を鍵札とする今回の読みでは、六つの位置がばらばらな助言ではなく、一つの順番を持つ物語として並んでいます',
      '{recipient}へ向いた今夜の星図は、{keyCardName} を起点にしながら、過去の背景と現在の課題と未来の兆しを丁寧につなぐ流れ',
      '今回の配列は {keyCardName} が先に輪郭を与え、そのうえで各札が実際の一歩と内面の整え方を補う構造です',
      '{keyCardName} が主役の夜であるぶん、今回の読みは一枚の強い断定ではなく、複数の面が同じ主題を静かに支え合います',
      '今夜の六芒は {keyCardName} を中心に収束しており、問いの背景から次章への流れまでが一つの道筋として見えています',
      '{recipient}の今回の読みでは、{keyCardName} が全体の重心を握り、それぞれの位置札がその重心へ意味を返すように並んでいます',
      '{keyCardName} が中心に立ったことで、今回の星図は感情の整理だけでなく、現実へ移せる順番まで含んだ読みになりました',
      '今夜の配列は {keyCardName} を軸に、曖昧だった迷いを過去・現在・未来・手段・心・全体運勢へ静かに分けて見せる構図',
    ],
    { lengths: ['long'] },
  ),
]

const summaryBridges = createSeries('summary.bridge', 'summary-bridge', [
  '過去から現在へは背後の余韻が静かに流れ込み、未来にはその延長線上の兆しが淡く見えています',
  '今回の読みでは、過去の積み重ねが現在の課題を作り、その扱い方が未来の輪郭を決めていきます',
  '札の流れを見ると、これまでの選び方が今の迷いに続いており、ここでの整え方が次の景色を変えます',
  '過去・現在・未来の三面は切れておらず、ひとつの川のようにつながって同じ主題を運んでいます',
  '今夜の配列は、背後にある影響といま強い論点とこの先の兆しが一本の細い線で結ばれています',
  '時間の流れに沿って読むと、これまでの背景が今の輪郭を作り、その先に現れる変化まで見えてきます',
  '今回の札は、過去を回想させるためでなく、現在の判断と未来の兆しを一つの順番へ並べ直しています',
  '過去札の余韻は現在にまだ届いており、未来札はその延長線上でどこが変わるかを示しています',
  '今夜の流れは、これまでの癖が現在で濃く出て、その扱い方しだいで未来の色味が変わる形です',
  '三つの時間面を比べると、同じ主題が少しずつ姿を変えながら先へ進んでいるのが分かります',
])

const summaryClosings = createSeries('summary.closing', 'summary-closing', [
  '今夜は答えを増やすより、先に触れる一点を決めることがこの読みを現実へつなぎます',
  '読みを活かすには、大きく変えるより順番を守って小さく動くほうが自然です',
  '札は強い断定ではなく、無理なく整えるための静かな順路を示しています',
  '今回の示唆は、急ぐことよりも輪郭を確かめることに価値があります',
  'いちばん濃く出た札にひとつ応えるだけでも、今夜の読みは十分に息をし始めます',
  'いま必要なのは全部を抱えることではなく、最初の一歩にだけ静かに責任を持つことです',
  'この読みは気分を盛り上げるためではなく、次の行動をやさしく定めるためにあります',
  '今夜は勢いより精度を優先するほど、札の示唆がそのまま役に立ちます',
  '読むだけで終えず、ひとつでも現実の手つきへ移せば流れは十分に変わります',
  '札の余韻が残るうちに一点だけ整えることが、今回の配列にはよく合っています',
])

const intentAngleTexts: Record<IntentCategory, string[]> = {
  仕事: [
    '仕事では、いま最優先で手を入れるべき工程と、その順番の組み替え',
    '仕事の読みでは、曖昧な役割分担や判断基準のぼやけがどこにあるか',
    '仕事に関しては、成果より前に整えるべき土台と連携の呼吸',
    '仕事面では、止まっている案件をどこから動かすと負荷が減るか',
    '仕事の論点としては、納期に追われる場面で優先順位がどこで混線したか',
    '仕事の読みでは、続け方の無理と、今週のうちに整えられる実務の輪郭',
  ],
  配信活動: [
    '配信活動では、見せ方の芯と、継続のために守るべき呼吸の位置',
    '配信の読みでは、企画より先に整えるべき更新ペースと表現の輪郭',
    '配信活動に関しては、視聴の流れを見ながら消耗しない続け方をどう作るか',
    '配信面では、やりたいことと視聴者へ届く見せ方のすり合わせ',
    '配信活動の論点として、更新線の乱れと企画の出し方の軸',
    '配信の読みでは、継続を崩さずに魅力を残すための視聴導線',
  ],
  恋愛: [
    '恋愛では、気持ちの温度差と、いま渡すべき言葉の輪郭',
    '恋愛の読みでは、相手との距離がどこで揺れ、本音がどこで止まるか',
    '恋愛面においては、やり取りの間にある迷いと、距離の詰め方の順番',
    '恋愛の論点として、相手へ期待しすぎた気持ちをどこで整えるか',
    '恋愛では、相手を読むより先に自分の本音がどこで震えるか',
    '恋愛の読みでは、やり取りの柔らかさと本音を伝える距離の見極め',
  ],
  人間関係: [
    '人間関係では、距離感の偏りと役割の背負いすぎがどこにあるか',
    '人間関係の読みでは、関わり方の癖と境界線の引き直し方',
    '人との関係面では、言えないことがどこで重くなり、距離感がどう崩れたか',
    '人間関係の論点として、支え合いと我慢の境目、そして役割の偏り',
    '関係性の読みでは、相手を変えるより整えるべき自分の立ち位置と境界線',
    '人間関係では、無理に合わせている場所と、本来守りたい関わり方の輪郭',
  ],
  創作: [
    '創作では、詰まりの正体と次に試すべき試作の選び方',
    '創作の読みでは、素材が散り、表現の焦点がぼやける地点',
    '創作面においては、素材の見直しと小さな試作公開の順番',
    '創作の論点として、締切に追われた時に推敲がどこで止まるか',
    '創作では、やりたい表現と実際に形へできる試作手順の距離',
    '創作の読みでは、止まった熱を再点火するための素材選びと推敲の起点',
  ],
  学業: [
    '学業では、続けやすい学び方と負荷のかかり方の見直し',
    '学業の読みでは、復習の配分と集中の波がどこで崩れているか',
    '勉強面においては、理解と暗記の順番、そして学び方の癖',
    '学業の論点として、焦りで積みすぎた課題と復習のほどき方',
    '学業では、いまの方法が合っているかを静かに見直し、理解の芯を確かめること',
    '学びの読みでは、結果より先に確かめたい集中時間と配分の土台',
  ],
  メンタル: [
    'メンタル面では、負荷の出どころと心を守る順番の確認',
    'メンタルの読みでは、刺激を受けすぎて揺れが大きくなる場所の見直し',
    '心の面においては、休息より先に減らすべき刺激と負荷の特定',
    'メンタルの論点として、抱えすぎた役目と境界のゆるみ',
    '心の読みでは、気力を足すより静けさを守るための休息設計',
    'メンタル面では、我慢の癖と揺れを大きくする刺激からの距離',
  ],
  その他: [
    '今回の読みでは、いま最も重い論点をどこからほどくか',
    'その他の問いとして、曖昧な悩みを一つの輪郭へまとめること',
    '今回の主題では、散っている不安をどの順で拾うと見やすいか',
    'その他の読みでは、いま本当に効いている問題を静かに見極めること',
    '今回の論点として、迷いを増やさず先に整えるべき一点の発見',
    'その他の問いでは、名前のない違和感をどこまで言葉にできるか',
  ],
}

const intentClosingTexts: Record<IntentCategory, string[]> = {
  仕事: [
    '仕事では、工程の順番を整えることが、そのまま読みの効き目になります',
    '仕事の場面では、案件を一度に全部動かすより、優先順位を一本化するほうが前に進みます',
    '仕事については、連携を急ぐ前に判断基準を一文へまとめると流れが安定します',
    '仕事の読みは、納期に追われるほど実務を細かく分けるほうが現実に効きます',
    '仕事では、やる気を増やすより着手地点と判断基準を明確にすることが先になります',
    '仕事の面では、今夜決める案件と保留してよい工程を分けるだけでも十分です',
  ],
  配信活動: [
    '配信活動では、企画を増やすより見せ方の芯を一つ決めるほうが魅力が届きます',
    '配信の読みは、継続できる更新線に整えるほど活きるので、無理のない更新を優先してください',
    '配信活動では、視聴を気にしすぎるより、自分の呼吸で続く企画設計が今夜の助けになります',
    '配信面では、見せ方の軸が定まるだけで迷いの霧はかなり薄くなります',
    '配信活動については、反応を追いすぎず、継続しやすい更新リズムを選ぶほうが長く効きます',
    '配信では、企画の数より、今夜ひとつ磨く見せ方を決めることが次章へつながります',
  ],
  恋愛: [
    '恋愛では、やさしさで流さず、本音をひとつだけ言葉へ寄せることが読みを活かします',
    '恋愛の面では、相手を当てにいくより、自分の気持ちが何に揺れたかを確かめるほうが前に進みます',
    '恋愛については、急いで答えを出すより、相手との距離をどう取りたいかを先に知ることが大切です',
    '恋愛では、やり取りを増やす前に、本音をどの温度で渡すかを整えることが鍵になります',
    '恋愛の読みは、関係を進める前に言葉の温度と距離の置き方を整えるほど現実に効いてきます',
    '恋愛の場面では、期待より事実をひとつ拾うだけでも気持ちの揺れは落ち着いていきます',
  ],
  人間関係: [
    '人間関係では、相手を変えるより自分の距離感を整えるほうが流れは動きます',
    '関係の読みでは、役割を背負いすぎず、境界線を戻すことが次章の静けさにつながります',
    '人間関係については、伝える内容よりも、どこまで引き受けるかという関わり方を決めることが先です',
    '関係性の面では、やさしさと境界線を同時に持つことが今夜の要点です',
    '人とのことでは、疲れを無視して合わせ続けるより、一度距離感を測り直すほうが自然です',
    '人間関係では、すぐに和解を目指さなくても、役割の置き方を整えるだけで読みは十分に活きます',
  ],
  創作: [
    '創作では、完璧さより試作の呼吸を戻すことが、停滞をいちばん素直にほどきます',
    '創作の場面では、大きな完成像より今夜の小さな試作点を決めるほうが前に進みます',
    '創作については、素材を抱え込むより、ひとつ出してから推敲する軽さが今はちょうど合っています',
    '創作では、頭の中だけで表現を磨くより、外へ置ける試作にして初めて霧が薄くなります',
    '創作の読みは、素材を絞り、締切までに一つの核だけ掴むほど効いてきます',
    '創作面では、止まった理由を責めるより、再開しやすい試作入口を作ることが大切です',
  ],
  学業: [
    '学業では、努力量を責めるより、続けやすい配分へ組み替えることが先になります',
    '学びの面では、長時間よりも戻りやすい復習の型をつくるほうが今夜の札に合っています',
    '学業については、全部を詰め込まず、理解の核を一つずつ押さえる進め方が向いています',
    '勉強では、焦りで量を増やすより、学び方と集中の配分を整えるほうが結果へつながりやすいです',
    '学業の読みは、今夜ひとつ復習の順番を見直すだけでも十分で、無理な立て直しは必要ありません',
    '学びでは、出来なかったことより、理解が進んだ学び方を手元に残すことが次章への助けになります',
  ],
  メンタル: [
    'メンタル面では、元気を足すより負荷を減らす順番を選ぶほうがやさしい前進になります',
    '心の読みでは、無理に明るくするより刺激を減らし、休息を守る工夫が今夜の支えになります',
    'メンタルについては、抱えた役目を減らし、境界を引き直すだけでも流れはかなり変わります',
    '心の面では、頑張る方法を増やすより、休息を邪魔している刺激をほどくのが先です',
    'メンタルの読みは、何かを足す話より、いま削ってよい負荷を見極める話として活きます',
    '心については、回復を急がず、まず揺れを大きくしている刺激から離れるとよいです',
  ],
  その他: [
    '今回の問いでは、答えを急がず、一番重い論点から順に照らすほうが読みは現実に落ちます',
    'その他の悩みでは、迷いを増やさず、まずひとつ名前をつけることが入口になります',
    '今回の読みは、全部を整理しきるより、最初の一点をはっきりさせるほうが役に立ちます',
    'その他の論点では、今夜決めることと寝かせることを分けるだけでも十分な前進です',
    '今回の主題については、気持ちの整理より先に、何が本題かを見極めることが助けになります',
    'その他の問いでは、結論を探すより輪郭を整える時間として使うほうが自然です',
  ],
}

const timeframeAngleTexts: Record<TimeframeOption, string[]> = {
  今日: [
    '今日の終わりまでに触れられる小さな変化',
    '今夜のうちに一つだけ整えられる論点',
    '今日という短い幅で見た時の最初の一歩',
    '今夜すぐ反映できる行動の手ざわり',
    '今日の空気の中で濃く出やすい気持ちの揺れ',
    '今夜から明朝までに持ち越したくない重さ',
  ],
  明日: [
    '明日へ持ち越す前に整えたい流れ',
    '明日の動き出しを軽くするための準備',
    '明日ひとつ試せる現実的な一手',
    '明日に影響しやすい今夜の選び方',
    '明日を迎える前に言葉にしておきたい輪郭',
    '明日の空気を変えるための静かな仕込み',
  ],
  今週: [
    '今週の中でじわりと効いてくる選び方',
    '一週間単位で見た時の優先順位の置き直し',
    '今週を過ごすうえで先に整えたい土台',
    '今週の流れを重くしないための見直し点',
    '今週のうちに育ちやすい変化の芽',
    'この一週間で無理なく試せる具体策',
  ],
  来週: [
    '来週へつなぐために今のうちに整える備え',
    '次の一週間へ持っていきたい方針の輪郭',
    '来週の自分を軽くするための仕込み',
    '来週の流れに響きやすい今の選択',
    '次の週へ向けた静かな準備線',
    '来週の前半を安定させるための整え方',
  ],
  来月: [
    '来月にかけて育っていく変化の筋道',
    '来月の流れを左右する今の整え方',
    'ひと月単位で見た時の再編の方向',
    '来月に残したいものと手放したいものの選別',
    '来月へ持ち越す価値のある課題の輪郭',
    '来月の空気を変えるための土台づくり',
  ],
  今年: [
    '今年という長い幅で見た時の方針と再配置',
    '年単位で静かに効いてくる選び方',
    '今年の流れの中で軸にしたい考え方',
    '一年を通して見た時の立て直しの方向',
    '今年の後半まで響く可能性がある整え方',
    '年の流れを穏やかに変えるための根本調整',
  ],
}

const intentAngles = createScopedSeries(
  'intentAngle',
  'intent-angle',
  intentAngleTexts,
  (intent) => ({ intents: [intent] }),
)

const intentClosings = createScopedSeries(
  'intentClosing',
  'intent-closing',
  intentClosingTexts,
  (intent) => ({ intents: [intent] }),
)

const timeframeAngles = createScopedSeries(
  'timeframeAngle',
  'timeframe-angle',
  timeframeAngleTexts,
  (timeframe) => ({ timeframes: [timeframe] }),
)

export const synthesisFragments: SynthesisFragment[] = [
  ...totalCommentOpeners,
  ...totalCommentPastBridges,
  ...totalCommentPresentBridges,
  ...totalCommentFutureBridges,
  ...totalCommentMethodPhrases,
  ...totalCommentMindsetPhrases,
  ...totalCommentFortunePhrases,
  ...totalCommentRelationBridges,
  ...totalCommentBackgroundBridges,
  ...totalCommentPairBridges,
  ...totalCommentClosings,
  ...snapshotHeadlineOpeners,
  ...snapshotFocusLeads,
  ...snapshotNextStepLeads,
  ...snapshotCautionLeads,
  ...snapshotHistoryFormats,
  ...summaryOpeners,
  ...summaryBridges,
  ...summaryClosings,
  ...intentAngles,
  ...intentClosings,
  ...timeframeAngles,
]

export const synthesisFragmentCounts = synthesisFragments.reduce<Record<string, number>>(
  (counts, fragment) => {
    counts[fragment.slot] = (counts[fragment.slot] ?? 0) + 1
    return counts
  },
  {},
)
