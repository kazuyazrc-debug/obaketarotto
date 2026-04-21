import type { FragmentDefinition, Position, Tone } from './types'

function createFragment(
  id: string,
  kind: FragmentDefinition['kind'],
  text: string,
  options: Partial<Omit<FragmentDefinition, 'id' | 'kind' | 'text'>> = {},
): FragmentDefinition {
  return {
    id,
    kind,
    text,
    bias: options.bias ?? 'neutral',
    tones: options.tones,
    topics: options.topics,
    position: options.position ?? 'any',
    energy: options.energy,
    adviceMode: options.adviceMode,
    keywords: options.keywords,
    tags: options.tags,
  }
}

function toneList(...tones: Tone[]) {
  return tones
}

export const sharedOpeners: FragmentDefinition[] = [
  createFragment(
    'opener-shared-hushed-1',
    'opener',
    '月明かりの縁で、{displayName}は{theme}の輪郭をそっと浮かべる',
    { bias: 'light', tones: toneList('hushed', 'tender'), position: 'upright' },
  ),
  createFragment(
    'opener-shared-hushed-2',
    'opener',
    '静けさの底から、{displayName}は{lightMeaning}という合図を差し出す',
    { bias: 'light', tones: toneList('hushed', 'oracular'), position: 'upright' },
  ),
  createFragment(
    'opener-shared-hushed-3',
    'opener',
    'ろうそくの火が揺れるたび、{displayName}は{emotion}を見逃さないでと囁く',
    { bias: 'neutral', tones: toneList('hushed', 'tender'), position: 'any' },
  ),
  createFragment(
    'opener-shared-oracular-1',
    'opener',
    '{displayName}は、いまの問いに{theme}という名の門を開く',
    { bias: 'neutral', tones: toneList('oracular'), position: 'any' },
  ),
  createFragment(
    'opener-shared-oracular-2',
    'opener',
    '{displayName}が照らすのは、{lightMeaning}へ向かう静かな起点',
    { bias: 'light', tones: toneList('oracular', 'hushed'), position: 'upright' },
  ),
  createFragment(
    'opener-shared-tender-1',
    'opener',
    '淡い霧の向こうで、{displayName}は無理に急がなくていいと伝える',
    { bias: 'light', tones: toneList('tender', 'hushed'), position: 'upright' },
  ),
  createFragment(
    'opener-shared-shadow-1',
    'opener',
    '水面の揺れに目を凝らすと、{displayName}は{shadowMeaning}の影を先に映す',
    { bias: 'shadow', tones: toneList('hushed', 'oracular'), position: 'reversed' },
  ),
  createFragment(
    'opener-shared-shadow-2',
    'opener',
    '古い手紙の折り目のように、{displayName}は{warning}を静かに示している',
    { bias: 'shadow', tones: toneList('hushed', 'tender', 'oracular'), position: 'reversed' },
  ),
]

export const sharedStates: FragmentDefinition[] = [
  createFragment(
    'state-shared-1',
    'state',
    'いま表に出ているのは、{lightMeaning}へ向かう流れ',
    { bias: 'light', tones: toneList('hushed', 'oracular', 'tender'), position: 'upright' },
  ),
  createFragment(
    'state-shared-2',
    'state',
    '問いの中心では、{emotion}がまだ言葉になる手前で揺れている',
    { bias: 'neutral', tones: toneList('hushed', 'tender', 'oracular'), position: 'any' },
  ),
  createFragment(
    'state-shared-3',
    'state',
    '輪郭を曖昧にしているのは、{shadowMeaning}へ寄ってしまう癖',
    { bias: 'shadow', tones: toneList('hushed', 'oracular'), position: 'reversed' },
  ),
  createFragment(
    'state-shared-4',
    'state',
    '見落とせない芯には、{theme}をどう扱うかという論点がある',
    { bias: 'neutral', tones: toneList('oracular', 'hushed'), position: 'any' },
  ),
  createFragment(
    'state-shared-5',
    'state',
    '静かに効いているのは、{lightMeaning}を信じきれないためのためらい',
    { bias: 'shadow', tones: toneList('hushed', 'tender'), position: 'reversed' },
  ),
  createFragment(
    'state-shared-6',
    'state',
    'この札は、{theme}を自分の足元へ引き寄せて考える時だと告げる',
    { bias: 'light', tones: toneList('hushed', 'oracular', 'tender'), position: 'upright' },
  ),
  createFragment(
    'state-shared-7',
    'state',
    '表情よりも奥で、{emotion}が選び方そのものに影を落としている',
    { bias: 'neutral', tones: toneList('oracular', 'hushed'), position: 'any' },
  ),
  createFragment(
    'state-shared-8',
    'state',
    '逆位置では、{warning}を放置したまま進むと輪郭がさらに濁りやすい',
    { bias: 'shadow', tones: toneList('hushed', 'oracular'), position: 'reversed' },
  ),
]

export const sharedHidden: FragmentDefinition[] = [
  createFragment(
    'hidden-shared-1',
    'hidden',
    'まだ表に出ていない奥では、{theme}を守りたい気持ちが静かに残っている',
    { bias: 'neutral', tones: toneList('hushed', 'oracular', 'tender') },
  ),
  createFragment(
    'hidden-shared-2',
    'hidden',
    '本当は、{emotion}を正直に認めた瞬間から流れが変わり始める',
    { bias: 'light', tones: toneList('tender', 'hushed', 'oracular') },
  ),
  createFragment(
    'hidden-shared-3',
    'hidden',
    '言葉の隙間には、{shadowMeaning}を恐れて手を止める癖が潜んでいる',
    { bias: 'shadow', tones: toneList('hushed', 'oracular') },
  ),
  createFragment(
    'hidden-shared-4',
    'hidden',
    '輪郭の裏側では、{lightMeaning}を受け取る準備がゆっくり進んでいる',
    { bias: 'light', tones: toneList('hushed', 'tender', 'oracular') },
  ),
  createFragment(
    'hidden-shared-5',
    'hidden',
    'ほんの少しだけ視点をずらすと、{warning}が防御ではなく手がかりに変わる',
    { bias: 'neutral', tones: toneList('hushed', 'oracular', 'tender') },
  ),
  createFragment(
    'hidden-shared-6',
    'hidden',
    '見えにくい場所では、{theme}の扱い方そのものが次章の準備になっている',
    { bias: 'neutral', tones: toneList('oracular', 'hushed') },
  ),
]

export const sharedWarnings: FragmentDefinition[] = [
  createFragment(
    'warning-shared-1',
    'warning',
    '{warning}を軽く見ると、静かな乱れが長引きやすい',
    { bias: 'shadow', tones: toneList('hushed', 'oracular', 'tender'), position: 'any', tags: ['warning'] },
  ),
  createFragment(
    'warning-shared-2',
    'warning',
    '逆位置では、{shadowMeaning}を無視したまま進むほど足元が曇る',
    { bias: 'shadow', tones: toneList('hushed', 'oracular'), position: 'reversed', tags: ['warning'] },
  ),
  createFragment(
    'warning-shared-3',
    'warning',
    '急いで形だけ整えると、{emotion}が置き去りになってあとで揺り返す',
    { bias: 'shadow', tones: toneList('hushed', 'tender', 'oracular'), position: 'any', tags: ['warning'] },
  ),
  createFragment(
    'warning-shared-4',
    'warning',
    '今夜は、{theme}を怖れすぎても抱え込みすぎても流れが細くなる',
    { bias: 'neutral', tones: toneList('hushed', 'oracular', 'tender'), position: 'any', tags: ['warning'] },
  ),
]

export const sharedAdvices: FragmentDefinition[] = [
  createFragment(
    'advice-shared-act-1',
    'advice',
    'まずは{action}。月明かりの届く範囲で一歩を確かめたい',
    {
      bias: 'light',
      tones: toneList('oracular', 'hushed', 'tender'),
      position: 'upright',
      energy: 'active',
      adviceMode: 'act',
      tags: ['act-now'],
    },
  ),
  createFragment(
    'advice-shared-act-2',
    'advice',
    '{action}ことで、いま曖昧な輪郭が現実へ降りてくる',
    {
      bias: 'light',
      tones: toneList('oracular', 'hushed'),
      position: 'upright',
      energy: 'active',
      adviceMode: 'act',
      tags: ['act-now'],
    },
  ),
  createFragment(
    'advice-shared-observe-1',
    'advice',
    '{action}前に、{theme}がどこで揺れるかをもう少し観察したい',
    {
      bias: 'neutral',
      tones: toneList('hushed', 'tender', 'oracular'),
      position: 'any',
      energy: 'balanced',
      adviceMode: 'observe',
      tags: ['observe'],
    },
  ),
  createFragment(
    'advice-shared-release-1',
    'advice',
    '逆位置では、いったん{action}ことで重さを解いたほうがよい',
    {
      bias: 'shadow',
      tones: toneList('hushed', 'tender', 'oracular'),
      position: 'reversed',
      energy: 'passive',
      adviceMode: 'release',
      tags: ['release'],
    },
  ),
  createFragment(
    'advice-shared-wait-1',
    'advice',
    '今夜はすぐ決め切らず、{action}まで待つ静けさも力になる',
    {
      bias: 'shadow',
      tones: toneList('hushed', 'tender'),
      position: 'reversed',
      energy: 'passive',
      adviceMode: 'wait',
      tags: ['wait'],
    },
  ),
  createFragment(
    'advice-shared-act-3',
    'advice',
    '{action}ことが、ぼやけた問いを確かな輪郭へ変える',
    {
      bias: 'light',
      tones: toneList('tender', 'oracular', 'hushed'),
      position: 'upright',
      energy: 'active',
      adviceMode: 'act',
      tags: ['act-now'],
    },
  ),
  createFragment(
    'advice-shared-observe-2',
    'advice',
    '{action}前に、ろうそくの火を見るように自分の反応を確かめたい',
    {
      bias: 'neutral',
      tones: toneList('hushed', 'tender'),
      position: 'any',
      energy: 'balanced',
      adviceMode: 'observe',
      tags: ['observe'],
    },
  ),
  createFragment(
    'advice-shared-release-2',
    'advice',
    '{warning}をほどくつもりで、{action}ところから始めるのがやさしい',
    {
      bias: 'shadow',
      tones: toneList('tender', 'hushed'),
      position: 'reversed',
      energy: 'passive',
      adviceMode: 'release',
      tags: ['release'],
    },
  ),
]

export const sharedClosings: FragmentDefinition[] = [
  createFragment(
    'closing-shared-hushed-1',
    'closing',
    '答えはまだ薄明かりの中にあるが、今夜の一歩はもう見えている',
    { bias: 'light', tones: toneList('hushed', 'oracular', 'tender'), position: 'upright', energy: 'balanced' },
  ),
  createFragment(
    'closing-shared-hushed-2',
    'closing',
    '霧がすぐに晴れなくても、静かな選び直しは確実に効いていく',
    { bias: 'light', tones: toneList('hushed', 'tender'), position: 'upright', energy: 'passive' },
  ),
  createFragment(
    'closing-shared-hushed-3',
    'closing',
    '輪郭を急がず守るほど、次の朝には迷いが少し整っている',
    { bias: 'light', tones: toneList('hushed', 'tender', 'oracular'), position: 'upright', energy: 'passive' },
  ),
  createFragment(
    'closing-shared-oracular-1',
    'closing',
    '札は、境目の一歩を越えた先で流れが変わると告げている',
    { bias: 'neutral', tones: toneList('oracular', 'hushed'), position: 'any', energy: 'balanced' },
  ),
  createFragment(
    'closing-shared-oracular-2',
    'closing',
    '古い手紙を閉じるように整えれば、次の章は静かに開いていく',
    { bias: 'light', tones: toneList('oracular', 'hushed', 'tender'), position: 'upright', energy: 'balanced' },
  ),
  createFragment(
    'closing-shared-tender-1',
    'closing',
    'こわさが残っても大丈夫で、今夜はそれでも進める分だけ進めばいい',
    { bias: 'light', tones: toneList('tender', 'hushed'), position: 'any', energy: 'passive' },
  ),
  createFragment(
    'closing-shared-shadow-1',
    'closing',
    '逆位置の夜は、急がずほどくこと自体が次の光を招く',
    { bias: 'shadow', tones: toneList('hushed', 'tender', 'oracular'), position: 'reversed', energy: 'passive' },
  ),
  createFragment(
    'closing-shared-shadow-2',
    'closing',
    'すぐに結論へ飛ばなくても、静けさを保つほど流れは持ち直す',
    { bias: 'shadow', tones: toneList('hushed', 'tender'), position: 'reversed', energy: 'passive' },
  ),
]

export function filterByPosition(
  fragments: FragmentDefinition[],
  position: Position,
) {
  return fragments.filter((fragment) => fragment.position === 'any' || fragment.position === position)
}
