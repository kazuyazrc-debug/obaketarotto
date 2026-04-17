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

  const snapshot = buildReadingSnapshot(reading)
  const keyPosition = reading.positions.find((position) => position.cardNo === reading.keyCardNo)

  drawBackground(context)
  drawHexagramFrame(context)
  drawMoonPhases(context)

  context.fillStyle = 'rgba(244, 239, 228, 0.88)'
  context.font = '600 20px "Yu Gothic", "Hiragino Sans", sans-serif'
  context.fillText('Obake Tarot Reading', 72, 64)

  context.fillStyle = 'rgba(214, 223, 245, 0.82)'
  context.font = '500 16px "Yu Gothic", "Hiragino Sans", sans-serif'
  context.fillText(`${reading.spread.name} / ${reading.input.intent} / ${reading.input.timeframe}`, 72, 92)

  context.fillStyle = '#fbf8f1'
  context.font = '700 48px "Yu Mincho", "Hiragino Mincho ProN", serif'
  wrapText(context, reading.input.question || '今夜のリーディング', 72, 156, 580, 62, 3)

  fillRoundRect(context, 58, 344, 626, 228, 28, 'rgba(17, 23, 40, 0.34)')
  strokeRoundRect(context, 58, 344, 626, 228, 28, 'rgba(236, 224, 190, 0.12)')

  context.fillStyle = 'rgba(242, 232, 205, 0.9)'
  context.font = '600 16px "Yu Gothic", "Hiragino Sans", sans-serif'
  context.fillText('Tonight', 88, 382)
  context.fillStyle = '#fff8ef'
  context.font = '700 28px "Yu Gothic", "Hiragino Sans", sans-serif'
  wrapText(context, sanitizeReadingText(snapshot.headline, reading), 88, 424, 560, 38, 3)

  context.fillStyle = 'rgba(224, 231, 248, 0.84)'
  context.font = '600 16px "Yu Gothic", "Hiragino Sans", sans-serif'
  context.fillText('Next Step', 88, 524)
  context.fillStyle = 'rgba(244, 247, 255, 0.94)'
  context.font = '500 20px "Yu Gothic", "Hiragino Sans", sans-serif'
  wrapText(context, sanitizeReadingText(snapshot.nextStep, reading), 88, 552, 560, 28, 2)

  fillRoundRect(context, 720, 68, 408, 250, 28, 'rgba(249, 245, 237, 0.94)')
  strokeRoundRect(context, 720, 68, 408, 250, 28, 'rgba(214, 195, 148, 0.24)')

  context.fillStyle = '#564a35'
  context.font = '600 16px "Yu Gothic", "Hiragino Sans", sans-serif'
  context.fillText('Key Card', 752, 108)
  context.fillStyle = '#1f2230'
  context.font = '700 40px "Yu Mincho", "Hiragino Mincho ProN", serif'
  wrapText(
    context,
    keyPosition ? `${keyPosition.cardNo}. ${keyPosition.cardName}` : 'Reading',
    752,
    164,
    340,
    48,
    2,
  )

  context.fillStyle = 'rgba(110, 86, 58, 0.9)'
  context.font = '500 18px "Yu Gothic", "Hiragino Sans", sans-serif'
  wrapText(
    context,
    keyPosition ? `${keyPosition.roleLabel} / ${keyPosition.motif}` : '',
    752,
    242,
    320,
    28,
    2,
  )

  fillRoundRect(context, 720, 346, 408, 226, 28, 'rgba(20, 24, 42, 0.38)')
  strokeRoundRect(context, 720, 346, 408, 226, 28, 'rgba(196, 205, 238, 0.14)')

  context.fillStyle = '#fff7ef'
  context.font = '600 16px "Yu Gothic", "Hiragino Sans", sans-serif'
  context.fillText('Reading', 752, 386)
  context.font = '500 20px "Yu Gothic", "Hiragino Sans", sans-serif'
  wrapText(context, sanitizeReadingText(reading.totalComment, reading), 752, 424, 334, 28, 4)

  context.fillStyle = 'rgba(214, 223, 245, 0.64)'
  context.font = '500 14px "Yu Gothic", "Hiragino Sans", sans-serif'
  context.fillText('moonlit / silver ritual / refined mystic', 72, 598)

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
  gradient.addColorStop(0, '#070b16')
  gradient.addColorStop(0.42, '#1a2140')
  gradient.addColorStop(1, '#344266')
  context.fillStyle = gradient
  context.fillRect(0, 0, WIDTH, HEIGHT)

  context.fillStyle = 'rgba(255, 255, 255, 0.88)'
  for (let index = 0; index < 120; index += 1) {
    const x = (index * 97) % WIDTH
    const y = (index * 53) % HEIGHT
    const radius = index % 9 === 0 ? 2.2 : 1.1
    context.beginPath()
    context.arc(x, y, radius, 0, Math.PI * 2)
    context.fill()
  }

  context.fillStyle = 'rgba(244, 234, 202, 0.1)'
  context.beginPath()
  context.arc(986, 118, 142, 0, Math.PI * 2)
  context.fill()
}

function drawHexagramFrame(context: CanvasRenderingContext2D) {
  context.save()
  context.translate(930, 192)
  context.strokeStyle = 'rgba(236, 224, 194, 0.48)'
  context.lineWidth = 2.2
  context.shadowColor = 'rgba(214, 197, 151, 0.18)'
  context.shadowBlur = 18

  drawTriangle(context, -96)
  drawTriangle(context, 84)

  context.beginPath()
  context.arc(0, 0, 18, 0, Math.PI * 2)
  context.strokeStyle = 'rgba(220, 228, 255, 0.72)'
  context.lineWidth = 2.6
  context.stroke()

  context.restore()
}

function drawTriangle(context: CanvasRenderingContext2D, apexY: number) {
  context.beginPath()
  if (apexY < 0) {
    context.moveTo(0, apexY)
    context.lineTo(-84, 56)
    context.lineTo(84, 56)
  } else {
    context.moveTo(0, apexY)
    context.lineTo(-84, -56)
    context.lineTo(84, -56)
  }
  context.closePath()
  context.stroke()
}

function drawMoonPhases(context: CanvasRenderingContext2D) {
  const phases = [0.26, 0.52, 0.82, 1, 0.82, 0.52, 0.26]
  phases.forEach((alpha, index) => {
    const x = 742 + index * 48
    const y = 586
    context.beginPath()
    context.fillStyle = `rgba(247, 240, 223, ${alpha})`
    context.arc(x, y, 8, 0, Math.PI * 2)
    context.fill()
  })
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

function fillRoundRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fillStyle: string,
) {
  roundRect(context, x, y, width, height, radius)
  context.fillStyle = fillStyle
  context.fill()
}

function strokeRoundRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  strokeStyle: string,
) {
  roundRect(context, x, y, width, height, radius)
  context.strokeStyle = strokeStyle
  context.lineWidth = 1
  context.stroke()
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
