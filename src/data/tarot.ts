export type IntentCategory =
  | '仕事'
  | '配信活動'
  | '恋愛'
  | '人間関係'
  | '創作'
  | '学業'
  | 'メンタル'
  | 'その他'

export type TimeframeOption = '今日' | '明日' | '今週' | '来週' | '来月' | '今年'

export type SpreadId = 'single' | 'three' | 'sixfold' | 'nica' | 'celtic'

export type ReadingLength = 'short' | 'medium' | 'long'

export type CardDefinition = {
  no: number
  arcana: string
  person: string
  role: string
  motif: string
  shortLine: string
  light: string
  shadow: string
  actions: string[]
}

export type SpreadPosition = {
  index: number
  label: string
  weight: number
  prompt: string
}

export type SpreadDefinition = {
  id: SpreadId
  name: string
  description: string
  cardCount: number
  positions: SpreadPosition[]
}

export const intentOptions: IntentCategory[] = [
  '仕事',
  '配信活動',
  '恋愛',
  '人間関係',
  '創作',
  '学業',
  'メンタル',
  'その他',
]

export const timeframeOptions: TimeframeOption[] = [
  '今日',
  '明日',
  '今週',
  '来週',
  '来月',
  '今年',
]

export const cards: CardDefinition[] = [
  { no: 0, arcana: '愚者', person: '鬼屋敷ジオ', role: '突破役', motif: '初手の爆発力', shortLine: '飛び込む。迷いより先に一歩。', light: '空気を読んで止まるより、まず動いて流れを作る時。ジオらしい初速が停滞を破る。', shadow: '勢いだけで突っ込むと、後から拾うべき火種まで増やしやすい。走る前に最低限の着地だけ決めたい。', actions: ['最初の一歩を24時間以内に形にする', '考えすぎる前に試し打ちする'] },
  { no: 1, arcana: '魔術師', person: 'nica', role: '発明役', motif: '試作と編集', shortLine: '材料は揃った。試作して形にする。', light: 'アイデアを語る段階はもう越えている。nica的に、いまは手札を編集して見せる番。', shadow: '準備の美しさに満足すると、実物が出ないまま熱が冷めやすい。見せる形にしないと魔法は始まらない。', actions: ['試作品をひとつ作る', '材料を3つに絞って見せる'] },
  { no: 2, arcana: '女教皇', person: '藤宮ハスミ', role: '観測役', motif: '静かな察知', shortLine: '静かな直感を信じる。観察が先。', light: '表の言葉より、沈黙や温度差に答えが潜む時。ハスミのように静かに見抜くほど精度が上がる。', shadow: '見えすぎるぶん、言葉にするのを遅らせると機会が抜け落ちる。察したあとに一言添える勇気も必要。', actions: ['結論を出す前に一晩置く', '違和感をメモに言語化する'] },
  { no: 3, arcana: '女帝', person: 'nica', role: '育成役', motif: '居場所づくり', shortLine: '育てて満たす。居場所を太らせる。', light: '結果より先に、安心して伸びる余白を作るべき時。nicaの女帝は、場の温度を上げて芽を守る。', shadow: '優しさを配りすぎると、自分の燃料が先に尽きる。育てるためにも境界線は必要。', actions: ['余裕が生まれる環境を整える', '育てたい対象に時間を配分する'] },
  { no: 4, arcana: '皇帝', person: '大神メウ', role: '統率役', motif: '号令と責任', shortLine: '責任を引き受け、場を持つ。', light: '曖昧なままでは進まない。メウの皇帝は、覚悟を見せて基準を置くことで全体を走らせる。', shadow: '正しさを急いで押し出すと、周囲の自由度が削れやすい。強さは、受け止める余裕とセットで使いたい。', actions: ['基準を1文で定義する', '役割分担を明文化する'] },
  { no: 5, arcana: '法王', person: 'まや', role: '案内役', motif: 'やわらかな基礎', shortLine: 'やさしく導く。基本に戻す。', light: '迷った時こそ、まやの法王は王道に戻してくれる。優しい言葉で土台を整えるほど、流れは安定する。', shadow: '人を安心させることを優先しすぎると、自分の本音や野心が薄まりやすい。丸めすぎには注意。', actions: ['基本手順を見直す', '信頼できる人に相談する'] },
  { no: 6, arcana: '恋人', person: '粒あんこ', role: '共鳴役', motif: '本音の選択', shortLine: '選ぶ。関係を“今”決める。', light: '誰と心を合わせるかが流れを決める時。あんこの恋人は、明るさの中にある本気の選択を促す。', shadow: '好かれたい気持ちが強すぎると、どの道も薄くなりやすい。優しさより先に選ぶこと。', actions: ['迷っている選択肢を二択まで減らす', '本音ベースで返答する'] },
  { no: 7, arcana: '戦車', person: '鬼屋敷ジオ', role: '推進役', motif: '勝ち筋の一点突破', shortLine: '押し切る。勝ち筋に寄せる。', light: '迷いを切って前に出るほど成果になる局面。ジオの戦車は、勢いを勝ち筋へ変換するカード。', shadow: 'アクセルだけ踏むと、周囲の足並みや燃費が置き去りになる。押す前に進路の確認を。', actions: ['優先順位を一本化する', '締切を先に決める'] },
  { no: 8, arcana: '力', person: 'Re.', role: '持久役', motif: 'やさしい強度', shortLine: '素直な強さ。優しく制御する。', light: '派手に勝つより、しなやかに続ける強さが必要。Re.の力は、荒れた空気を静かに抱えて前へ運ぶ。', shadow: '耐えることが美徳になりすぎると、限界のサインを見逃しやすい。強さは休む選択も含む。', actions: ['感情を整えてから対話する', '続けられる強さを選ぶ'] },
  { no: 9, arcana: '隠者', person: 'zrc', role: '探究役', motif: '沈黙の思索', shortLine: '一歩引く。答えは内側にある。', light: '外の期待を離れたところに、本当に納得できる答えがある。zrcの隠者は、静かな深掘りで核心へ寄る。', shadow: '考えることが避難所になると、必要な対話まで遠のきやすい。閉じすぎない一歩が大事。', actions: ['一人で考える時間を確保する', '本心を3行で書き出す'] },
  { no: 10, arcana: '運命の輪', person: 'zrc', role: '転換役', motif: '流れの読替え', shortLine: '流れが変わる。乗るか回すか。', light: '偶然やタイミングが味方しやすい時。zrcの輪は、変化を観測して自分の手で回し始める感覚を持つ。', shadow: '様子見が長すぎると、せっかくの追い風が人のものになる。変化に意味を与えるのは自分。', actions: ['変化の兆しにすぐ反応する', '選択肢を固定しすぎない'] },
  { no: 11, arcana: '正義', person: '羊のぬーん', role: '査定役', motif: '切れ味ある線引き', shortLine: '線引きする。基準を決め直す。', light: '情だけで進むと歪みが残る。ぬーんの正義は、少し鋭くても必要な線を引いてくれる。', shadow: '厳密さが増しすぎると、相手の事情を切り捨てやすい。正しさの刃先は自分にも向く。', actions: ['判断基準を紙に書く', '公平さを保つための条件を定める'] },
  { no: 12, arcana: '吊るされた男', person: 'よもすえぞう', role: '反転役', motif: '止まる意味', shortLine: '進めない時期。見方を反転する。', light: '停滞は失敗ではなく、前提を裏返す準備期間。よもすえぞうの吊るしは、止まることに意味を与える。', shadow: '我慢が長引きすぎると、自分だけが耐える構図を固定してしまう。止まるにも期限がほしい。', actions: ['別視点から問いを言い換える', '無理に進めず意味を探す'] },
  { no: 13, arcana: '死神', person: 'よもすえぞう', role: '更新役', motif: '終幕から再編', shortLine: '終わらせて更新する。切り替える。', light: '続ける理由より、終える意味が強くなる時。よもすえぞうの死神は、終幕を怖がらず次章の席を空ける。', shadow: '未練を握ったままだと、変化の痛みだけが残る。切り替えは宣言して初めて始まる。', actions: ['終えるものを一つ決める', '切り替えの合図を作る'] },
  { no: 14, arcana: '節制', person: 'まや', role: '調律役', motif: '混ぜて整える', shortLine: '混ぜて整える。極端を避ける。', light: '対立や温度差を、そのまま使える形へ整える時。まやの節制は、無理なく続く配合を見つける。', shadow: '穏便さを優先しすぎると、必要な違和感まで薄まる。丸く収めるだけでは前進しない。', actions: ['二つの案を折衷してみる', '生活リズムを整える'] },
  { no: 15, arcana: '悪魔', person: 'フジツボクジラ', role: '誘惑役', motif: '深夜の執着', shortLine: '惹かれる鎖。執着を見抜く。', light: '見ないふりをしてきた欲望こそ、いまのエネルギー源。フジツボクジラの悪魔は、その濃さを暴いてくる。', shadow: '心地よい依存に沈むと、自由を失っていることすら快感に変わる。快より主導権を選びたい。', actions: ['執着の正体を言語化する', 'やめたい習慣を一つ減らす'] },
  { no: 16, arcana: '塔', person: '羊のぬーん', role: '破壊役', motif: '本音の露出', shortLine: '崩れることで真実が出る。', light: '守っていた前提が壊れることで、ようやく本心が見える。ぬーんの塔は、痛いけれど嘘を剥がす。', shadow: '壊れること自体を恐れると、小さく済む崩れまで大事故に見えやすい。事実から逃げないこと。', actions: ['前提を一度壊して再構成する', '言いづらい本音を短く伝える'] },
  { no: 17, arcana: '星', person: '藤宮ハスミ', role: '希望役', motif: '遠い灯り', shortLine: '希望の光。遠くても進める。', light: 'まだ届かなくても、進む価値のある灯りは見えている。ハスミの星は、静かな希望を持続に変える。', shadow: '理想だけを見ていると、今日やるべき現実の一手が抜けやすい。光を見るなら足元も照らしたい。', actions: ['長期の願いを再確認する', '小さな希望の証拠を集める'] },
  { no: 18, arcana: '月', person: 'フジツボクジラ', role: '夜想役', motif: '揺れる感受性', shortLine: '不安と幻想。夜の感性を読む。', light: '輪郭の曖昧さにこそ本音が滲む。フジツボクジラの月は、言葉にならないざわつきを拾い上げる。', shadow: '不安と想像が混ざると、見えていないものまで敵に見えやすい。夜の感情は朝に再点検したい。', actions: ['不安と事実を分けて書く', '夜に決めず朝に再確認する'] },
  { no: 19, arcana: '太陽', person: '粒あんこ', role: '祝福役', motif: '明るい肯定', shortLine: '明るく開く。祝福と成功へ。', light: '率直さと楽しさがそのまま追い風になる時。あんこの太陽は、周囲を巻き込みながら前を照らす。', shadow: '楽しい勢いのまま細部を飛ばすと、あとで詰めの甘さが目立つ。明るさに段取りを添えたい。', actions: ['喜びを共有する', '前向きな案を言葉にして出す'] },
  { no: 20, arcana: '審判', person: '大神メウ', role: '再起役', motif: '呼び戻す号令', shortLine: '再始動。呼びかけに応える。', light: '止まっていたものに再点火のタイミングが来ている。メウの審判は、もう一度立つ理由を鳴らす。', shadow: '昔の失敗や評価に引っ張られると、再挑戦の合図が雑音に聞こえる。過去は判決ではない。', actions: ['再開のサインに返事をする', '保留案件を見直す'] },
  { no: 21, arcana: '世界', person: 'Re.', role: '完結役', motif: 'やり切る静けさ', shortLine: '完成して次章へ。大団円。', light: '積み上げてきたものが輪になって閉じる時。Re.の世界は、派手さより確かな完了で次章を開く。', shadow: '仕上げを怖れて締めを遅らせると、達成の手触りがぼやけてしまう。終わらせる勇気まで含めて完成。', actions: ['仕上げと公開の準備をする', '完了条件を決める'] },
]

export const spreads: SpreadDefinition[] = [
  { id: 'single', name: 'ワンオラクル', description: '今日から近日の迷いを、1枚でまっすぐ受け取る。', cardCount: 1, positions: [{ index: 0, label: '答え', weight: 1, prompt: '今の問いに対する中心的な助言' }] },
  { id: 'three', name: 'スリーカード', description: '過去・現在・未来の流れを、物語として読む。', cardCount: 3, positions: [{ index: 0, label: '過去', weight: 0.7, prompt: 'ここまでの流れや前提' }, { index: 1, label: '現在', weight: 1, prompt: 'いま最も強く働いている空気' }, { index: 2, label: '未来', weight: 0.85, prompt: 'このまま進んだ先の兆し' }] },
  { id: 'sixfold', name: '六芒スプレッド', description: '過去、現在、未来に加えて、手段、マインドセット、全体運勢を6枚で読み解く。', cardCount: 6, positions: [{ index: 0, label: '過去', weight: 0.72, prompt: 'ここまでの流れや背後にある影響' }, { index: 1, label: '現在', weight: 1, prompt: 'いま最も濃く出ている状況' }, { index: 2, label: '未来', weight: 0.88, prompt: 'このまま進んだ先に見える兆し' }, { index: 3, label: '手段', weight: 0.82, prompt: '状況を動かすための具体策' }, { index: 4, label: 'マインドセット', weight: 0.8, prompt: '心の持ち方と姿勢の整え方' }, { index: 5, label: '全体運勢', weight: 0.92, prompt: '今回の流れ全体を包む運気' }] },
  { id: 'nica', name: 'nica家スプレッド', description: 'コミュニティらしい役回りと次章の流れを7枚で可視化。', cardCount: 7, positions: [{ index: 0, label: '中心の意図', weight: 1, prompt: '今回の問いの核' }, { index: 1, label: '家の支え', weight: 0.8, prompt: '安心して頼れる土台' }, { index: 2, label: '絆の鍵', weight: 0.78, prompt: '関係や連携を動かす鍵' }, { index: 3, label: '影の成長', weight: 0.72, prompt: '痛みの中にある伸びしろ' }, { index: 4, label: '爆発ポイント', weight: 0.88, prompt: '一気に流れが変わる地点' }, { index: 5, label: '夢と誘惑', weight: 0.7, prompt: '惹かれる方向と注意点' }, { index: 6, label: '次章', weight: 0.92, prompt: 'まとまりの先に始まるもの' }] },
  { id: 'celtic', name: 'ケルト十字風', description: '複雑な状況を立体的にほどく、深読み向けの10枚。', cardCount: 10, positions: [{ index: 0, label: '現状', weight: 1, prompt: '現在地そのもの' }, { index: 1, label: '障害', weight: 0.95, prompt: '流れを止めている要因' }, { index: 2, label: '顕在意識', weight: 0.78, prompt: '自覚している願いや考え' }, { index: 3, label: '潜在意識', weight: 0.76, prompt: 'まだ言葉になっていない本音' }, { index: 4, label: '過去', weight: 0.7, prompt: 'すでに影響している出来事' }, { index: 5, label: '近い未来', weight: 0.86, prompt: '間もなく訪れる流れ' }, { index: 6, label: 'あなたの立場', weight: 0.82, prompt: 'いまの自分の姿勢' }, { index: 7, label: '他者と環境', weight: 0.74, prompt: '周囲や環境の働き' }, { index: 8, label: '願望と恐れ', weight: 0.81, prompt: '望みと不安が混ざる場所' }, { index: 9, label: '結果', weight: 0.97, prompt: '現時点で見える着地点' }] },
]

export const defaultDisclaimer =
  'これは内省と行動整理のための読みです。医療・法律・投資などの最終判断の代わりにはならないため、大切な判断はご自身の意思と必要な専門家の助言も合わせて行ってください。'
