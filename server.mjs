import { createServer } from 'node:http'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

loadLocalEnv()

const PORT = Number(process.env.PORT || 8787)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-5.4-mini'

const schema = {
  name: 'nica_tarot_enhancement',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      reading: {
        type: 'object',
        additionalProperties: false,
        properties: {
          summary: {
            type: 'object',
            additionalProperties: false,
            properties: {
              short: { type: 'string' },
              medium: { type: 'string' },
              long: { type: 'string' },
            },
            required: ['short', 'medium', 'long'],
          },
          positions: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                short: { type: 'string' },
                medium: { type: 'string' },
                long: { type: 'string' },
              },
              required: ['short', 'medium', 'long'],
            },
          },
          totalComment: { type: 'string' },
        },
        required: ['summary', 'positions', 'totalComment'],
      },
    },
    required: ['reading'],
  },
}

createServer(async (request, response) => {
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (request.method === 'OPTIONS') {
    response.writeHead(204)
    response.end()
    return
  }

  if (request.method !== 'POST' || request.url !== '/api/enhance-reading') {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
    response.end('Not found')
    return
  }

  if (!OPENAI_API_KEY) {
    response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' })
    response.end('OPENAI_API_KEY is not set')
    return
  }

  try {
    const body = await readJson(request)
    const result = await enhanceReading(body)
    response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
    response.end(JSON.stringify(result))
  } catch (error) {
    response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' })
    response.end(error instanceof Error ? error.message : 'Unknown server error')
  }
}).listen(PORT, () => {
  console.log(`AI reading server listening on http://localhost:${PORT}`)
})

async function enhanceReading({ input, reading }) {
  const prompt = [
    'あなたは「nica家タロット」の文章補助AIです。',
    'JSONのみを返してください。',
    '出力は必ず与えられたJSON Schemaに従ってください。',
    '占いの断定口調は避け、分析は冷静かつ客観的に、今後の方針は前向きで励ます調子にしてください。',
    '医療・法律・投資の判断を代替する表現は避け、内省と行動整理の範囲で書いてください。',
    'summary.short は短く要点を絞り、summary.medium は読みやすく整理し、summary.long は背景と流れが分かる文章にしてください。',
    'positions の各 short / medium / long は、その位置の意味とカードの役割が自然につながる文章にしてください。',
    'totalComment は結論から入り、六枚全体の流れをまとめたうえで、すぐ実行できる方向性を1つか2つ示してください。',
    '恋愛は感情理解と対話支援寄り、仕事や創作は実務寄りで具体的にしてください。',
    '入力の question, intent, timeframe, relationTheme, relationType, background を読み取り、文脈に沿って深めてください。',
  ].join('\n')

  const apiResponse = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      input: [
        {
          role: 'system',
          content: prompt,
        },
        {
          role: 'user',
          content: JSON.stringify({ input, reading }),
        },
      ],
      text: {
        format: {
          type: 'json_schema',
          ...schema,
        },
      },
    }),
  })

  const payload = await apiResponse.json()

  if (!apiResponse.ok) {
    throw new Error(payload.error?.message || 'OpenAI API request failed')
  }

  const text = extractText(payload)

  if (!text) {
    throw new Error('OpenAI response did not contain text output')
  }

  return JSON.parse(text)
}

function extractText(payload) {
  if (typeof payload.output_text === 'string' && payload.output_text) {
    return payload.output_text
  }

  const outputs = Array.isArray(payload.output) ? payload.output : []
  for (const item of outputs) {
    const contents = Array.isArray(item.content) ? item.content : []
    for (const content of contents) {
      if (content.type === 'output_text' && typeof content.text === 'string') {
        return content.text
      }
      if (content.type === 'text' && typeof content.text === 'string') {
        return content.text
      }
    }
  }

  return ''
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let raw = ''

    request.on('data', (chunk) => {
      raw += chunk
    })

    request.on('end', () => {
      try {
        resolve(JSON.parse(raw || '{}'))
      } catch (error) {
        reject(error)
      }
    })

    request.on('error', reject)
  })
}

function loadLocalEnv() {
  const envPath = resolve(process.cwd(), '.env')

  if (!existsSync(envPath)) {
    return
  }

  const raw = readFileSync(envPath, 'utf8')
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim()

    if (!trimmed || trimmed.startsWith('#')) {
      continue
    }

    const separatorIndex = trimmed.indexOf('=')
    if (separatorIndex === -1) {
      continue
    }

    const key = trimmed.slice(0, separatorIndex).trim()
    const value = trimmed.slice(separatorIndex + 1).trim()

    if (key && !process.env[key]) {
      process.env[key] = value
    }
  }
}
