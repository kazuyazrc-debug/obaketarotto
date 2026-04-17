import { cards } from './tarot'

// 表示上は一時的に非表示にするため、元の対応表はここにも保持しておく。
export const tarotCharacterBackup = cards.map(({ no, arcana, person, role, motif }) => ({
  no,
  arcana,
  person,
  role,
  motif,
}))
