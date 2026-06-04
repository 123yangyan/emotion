/**
 * 将 AI 洞察测试 JSON 写入本机 ai-results 目录，供 App 自动 ingest。
 * 用法：npm run seed:ai-insight
 */
import { mkdirSync, readFileSync, writeFileSync } from 'fs'
import { homedir } from 'os'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const fixturesDir = join(root, 'docs', 'fixtures')

const appData = process.env.APPDATA || join(homedir(), 'AppData', 'Roaming')
const resultsDir = join(appData, 'emotion-diary', 'data', 'ai-results')

function dateOffset(days) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function loadFixture(name, date) {
  const raw = readFileSync(join(fixturesDir, name), 'utf-8')
  const analyzedAt = `${date}T22:05:00.000Z`
  return raw.replaceAll('{{DATE}}', date).replaceAll('{{ANALYZED_AT}}', analyzedAt)
}

mkdirSync(resultsDir, { recursive: true })

const cases = [
  {
    file: 'ai-insight-test-dashboard-v4.json',
    date: dateOffset(0),
    label: '今日 · 仪表 v5（心情61↓ / 能力72 / 跨日回落期）'
  },
  {
    file: 'ai-insight-test-dashboard-yesterday-v4.json',
    date: dateOffset(-1),
    label: '昨日 · 仪表 v5（心情22 / 高风险 / 筑底期）'
  },
  { file: 'ai-insight-test-full.json', date: dateOffset(-2), label: '前日 · 洞察 v2 完整（中风险，无仪表分）' }
]

console.log('AI 洞察测试用例 →', resultsDir)
console.log('')

for (const c of cases) {
  const json = loadFixture(c.file, c.date)
  const outPath = join(resultsDir, `${c.date}.json`)
  writeFileSync(outPath, json, 'utf-8')
  console.log(`✓ ${c.label}`)
  console.log(`  ${outPath}`)
}

console.log('')
console.log('下一步：')
console.log('1. 若 App 已打开，切换到「仪表」页签（或重启 App）')
console.log('2. 今日应显示：坐标漂移缩略图 / 双引擎双线+阶段标签 / 主指导+日记入口')
console.log('3. 「AI 洞察」页签仍可查看 3 日卡片详情')
console.log('4. entry_id 跳转需历史中存在对应 id 的记录')
