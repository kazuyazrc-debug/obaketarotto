import { buildReadingSnapshot, type ReadingResult } from './reading'
import { sanitizeReadingText } from './readingDisplay'

const WIDTH = 1200
const HEIGHT = 630

export async function buildReadingShareBlob(reading: ReadingResult) {
  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = HEIGHT

  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Canvas context is unavailable')
  }

  drawBackground(context)
  const snapshot = buildReadingSnapshot(reading)

  const keyPosition = reading.positions.find(
    (position) => position.cardNo === reading.keyCardNo,
  )

  context.fillStyle = '#f6f1ff'
  context.font = '700 24px "Yu Gothic", "Hiragino Sans", sans-serif'
  context.fillText('nica家 Tarot Reading', 70, 66)
  context.font = '600 18px "Yu Gothic", "Hiragino Sans", sans-serif'
  context.fillStyle = 'rgba(246, 241, 255, 0.75)'
  context.fillText(reading.spread.name, 70, 94)

  context.fillStyle = '#fff8ff'
  context.font = '700 52px "Yu Mincho", "Hiragino Mincho ProN", serif'
  wrapText(
    context,
    reading.input.question || '今回のリーディング',
    70,
    152,
    610,
    72,
    3,
  )

  context.fillStyle = 'rgba(246, 241, 255, 0.78)'
  context.font = '500 24px "Yu Gothic", "Hiragino Sans", sans-serif'
  context.fillText(
    `${reading.spread.name} / ${reading.input.intent} / ${reading.input.timeframe}`,
    70,
    320,
  )

  context.fillStyle = 'rgba(25, 20, 48, 0.42)'
  roundRect(context, 60, 352, 620, 220, 30)
  context.fill()

  context.fillStyle = '#fff7ff'
  context.font = '700 24px "Yu Gothic", "Hiragino Sans", sans-serif'
  context.fillText('今回の核', 88, 398)
  context.font = '500 24px "Yu Gothic", "Hiragino Sans", sans-serif'
  wrapText(context, sanitizeReadingText(snapshot.headline, reading), 88, 438, 566, 34, 3)

  context.fillStyle = 'rgba(246, 241, 255, 0.72)'
  context.font = '600 20px "Yu Gothic", "Hiragino Sans", sans-serif'
  context.fillText('次の一歩', 88, 542)
  context.font = '500 20px "Yu Gothic", "Hiragino Sans", sans-serif'
  wrapText(context, sanitizeReadingText(snapshot.nextStep, reading), 190, 542, 460, 30, 2)

  drawKeyCard(context, keyPosition)
  drawInsight(context, reading, snapshot)

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to render share image'))
        return
      }

      resolve(blob)
    }, 'image/png')
  })
}

function drawBackground(context: CanvasRenderingContext2D) {
  const gradient = context.createLinearGradient(0, 0, WIDTH, HEIGHT)
  gradient.addColorStop(0, '#090d1a')
  gradient.addColorStop(0.45, '#1d2340')
  gradient.addColorStop(1, '#3b496f')
  context.fillStyle = gradient
  context.fillRect(0, 0, WIDTH, HEIGHT)

  context.fillStyle = 'rgba(255, 255, 255, 0.9)'
  for (let index = 0; index < 120; index += 1) {
    const x = (index * 97) % WIDTH
    const y = (index * 53) % HEIGHT
    const radius = index % 9 === 0 ? 2.2 : 1.1
    context.beginPath()
    context.arc(x, y, radius, 0, Math.PI * 2)
    context.fill()
  }

  context.beginPath()
  context.fillStyle = 'rgba(227, 220, 255, 0.1)'
  context.arc(1010, 120, 150, 0, Math.PI * 2)
  context.fill()
}

function drawKeyCard(
  context: CanvasRenderingContext2D,
  keyPosition: ReadingResult['positions'][number] | undefined,
) {
  context.fillStyle = 'rgba(255, 248, 240, 0.92)'
  roundRect(context, 760, 72, 340, 250, 28)
  context.fill()

  context.fillStyle = '#45346d'
  context.font = '700 22px "Yu Gothic", "Hiragino Sans", sans-serif'
  context.fillText('Key Card', 790, 116)

  context.font = '700 42px "Yu Mincho", "Hiragino Mincho ProN", serif'
  context.fillText(
    keyPosition ? `${keyPosition.cardNo}. ${keyPosition.cardName}` : 'Reading',
    790,
    172,
  )

  context.fillStyle = '#8f5e49'
  context.font = '500 22px "Yu Gothic", "Hiragino Sans", sans-serif'
  wrapText(
    context,
    keyPosition ? `${keyPosition.roleLabel} / ${keyPosition.motif}` : '',
    790,
    226,
    270,
    30,
    2,
  )
}

function drawInsight(
  context: CanvasRenderingContext2D,
  reading: ReadingResult,
  snapshot: ReturnType<typeof buildReadingSnapshot>,
) {
  context.fillStyle = 'rgba(21, 20, 42, 0.36)'
  roundRect(context, 720, 356, 400, 214, 28)
  context.fill()

  context.fillStyle = '#fff7ff'
  context.font = '700 26px "Yu Gothic", "Hiragino Sans", sans-serif'
  context.fillText('全体の読み', 760, 400)

  context.font = '500 20px "Yu Gothic", "Hiragino Sans", sans-serif'
  wrapText(context, sanitizeReadingText(snapshot.focus, reading), 760, 436, 320, 28, 3)

  context.font = '700 22px "Yu Gothic", "Hiragino Sans", sans-serif'
  context.fillText('流れの結論', 760, 514)
  context.font = '500 22px "Yu Gothic", "Hiragino Sans", sans-serif'
  wrapText(context, sanitizeReadingText(reading.totalComment, reading), 760, 542, 320, 26, 3)
}

function wrapText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
) {
  const chars = [...text]
  let line = ''
  let lineIndex = 0

  for (const char of chars) {
    const testLine = line + char
    const width = context.measureText(testLine).width

    if (width > maxWidth && line) {
      context.fillText(line, x, y + lineIndex * lineHeight)
      line = char
      lineIndex += 1
      if (lineIndex >= maxLines) {
        context.fillText('…', x, y + (maxLines - 1) * lineHeight)
        return
      }
      continue
    }

    line = testLine
  }

  context.fillText(line, x, y + lineIndex * lineHeight)
}

function roundRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  context.beginPath()
  context.moveTo(x + radius, y)
  context.lineTo(x + width - radius, y)
  context.quadraticCurveTo(x + width, y, x + width, y + radius)
  context.lineTo(x + width, y + height - radius)
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  context.lineTo(x + radius, y + height)
  context.quadraticCurveTo(x, y + height, x, y + height - radius)
  context.lineTo(x, y + radius)
  context.quadraticCurveTo(x, y, x + radius, y)
  context.closePath()
}
