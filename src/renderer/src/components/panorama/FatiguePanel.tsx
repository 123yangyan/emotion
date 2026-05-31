import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import type { EntryRow } from '../../../../main/database'
import type { FatigueCheck } from '../../../../shared/types'

/* ── 数据结构 ──────────────────────────────────── */

interface FatiguePoint {
  date: string        // 'MM-DD'
  ts: number          // 当日零点时间戳，用于排序 / X轴
  quality: number     // 原始 1-9 均值
  mapped: number      // quality-5，范围 -4~+4（与全景舱轴一致）
  count: number       // 当日检查次数
  load: string        // 当日最多出现的负荷
  symptoms: number    // 当日平均症状数 (0-3)
}

interface FatigueStats {
  totalCount: number
  avgQuality: number
  days: FatiguePoint[]
  loadCounts: { 少: number; 正常: number; 极多: number }
  symptomCounts: { hesitate: number; escape: number; brainFog: number }
}

/* ── 解析 & 聚合 ──────────────────────────────── */

function parseFatigueRows(entries: EntryRow[]): FatigueStats {
  const raw: Array<{ dateKey: string; ts: number; fc: FatigueCheck }> = []

  for (const e of entries) {
    if (!e.fatigue_check) continue
    try {
      const fc = JSON.parse(e.fatigue_check) as FatigueCheck
      const dt = new Date(e.occurred_at)
      const dateKey = e.occurred_at.slice(0, 10)   // YYYY-MM-DD
      const ts = new Date(dateKey).getTime()
      raw.push({ dateKey, ts, fc })
    } catch { /* skip */ }
  }

  if (raw.length === 0) {
    return { totalCount: 0, avgQuality: 0, days: [], loadCounts: { 少: 0, 正常: 0, 极多: 0 }, symptomCounts: { hesitate: 0, escape: 0, brainFog: 0 } }
  }

  // 全局统计
  const loadCounts: { 少: number; 正常: number; 极多: number } = { 少: 0, 正常: 0, 极多: 0 }
  const symptomCounts = { hesitate: 0, escape: 0, brainFog: 0 }
  let totalQ = 0

  for (const { fc } of raw) {
    loadCounts[fc.decision_load]++
    if (fc.hesitate) symptomCounts.hesitate++
    if (fc.escapeTendency) symptomCounts.escape++
    if (fc.brainFog) symptomCounts.brainFog++
    totalQ += fc.decision_quality
  }

  // 按日聚合
  const byDate = new Map<string, { ts: number; qualities: number[]; loads: string[]; syms: number[] }>()
  for (const { dateKey, ts, fc } of raw) {
    if (!byDate.has(dateKey)) byDate.set(dateKey, { ts, qualities: [], loads: [], syms: [] })
    const day = byDate.get(dateKey)!
    day.qualities.push(fc.decision_quality)
    day.loads.push(fc.decision_load)
    day.syms.push([fc.hesitate, fc.escapeTendency, fc.brainFog].filter(Boolean).length)
  }

  const days: FatiguePoint[] = [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dateKey, { ts, qualities, loads, syms }]) => {
      const avgQ = qualities.reduce((s, q) => s + q, 0) / qualities.length
      // 最多出现的负荷
      const loadMode = (['少', '正常', '极多'] as const).reduce((a, b) =>
        loads.filter(l => l === a).length >= loads.filter(l => l === b).length ? a : b
      )
      const mo = dateKey.slice(5, 7)
      const d = dateKey.slice(8, 10)
      return {
        date: `${mo}-${d}`,
        ts,
        quality: Math.round(avgQ * 10) / 10,
        mapped: Math.round((avgQ - 5) * 10) / 10,  // 映射 1-9 → -4~+4
        count: qualities.length,
        load: loadMode,
        symptoms: Math.round(syms.reduce((s, v) => s + v, 0) / syms.length * 10) / 10
      }
    })

  return {
    totalCount: raw.length,
    avgQuality: Math.round((totalQ / raw.length) * 10) / 10,
    days,
    loadCounts,
    symptomCounts
  }
}

/* ── 辅助 ─────────────────────────────────────── */

/** 按质量映射值决定点颜色（与象限配色呼应） */
function dotColor(mapped: number): string {
  if (mapped >= 2) return '#28904a'    // 心流区绿
  if (mapped >= 0) return '#c86028'    // 攻坚区橙
  if (mapped >= -2) return '#6b8fad'   // 机械区蓝灰
  return '#c25070'                     // 内耗陷阱紫红
}

/** 进度条统计行 */
function StatRow({ label, count, total, color }: { label: string; count: number; total: number; color: string }): JSX.Element {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="fp-stat-row">
      <span className="fp-stat-label">{label}</span>
      <div className="fp-stat-track">
        <div className="fp-stat-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="fp-stat-count">{count} 次</span>
    </div>
  )
}

/* ── 主组件 ───────────────────────────────────── */

interface Props {
  entries: EntryRow[]
}

export default function FatiguePanel({ entries }: Props): JSX.Element | null {
  const stats = parseFatigueRows(entries)
  if (stats.totalCount === 0) return null

  const totalSymptoms = stats.symptomCounts.hesitate + stats.symptomCounts.escape + stats.symptomCounts.brainFog
  const symptomRate = Math.round((totalSymptoms / (stats.totalCount * 3)) * 100)

  /* 质量映射值的 Y 轴刻度：与 -4~+4 对齐，标注原始分数 */
  const yTicks = [-4, -2, 0, 2, 4]
  const yTickLabel = (v: number): string => {
    const q = v + 5   // 映射回 1-9
    return `${q}分`
  }

  return (
    <div className="fatigue-panel">

      {/* ① 顶部三格摘要 */}
      <div className="fp-summary">
        <div className="fp-summary-item">
          <span className="fp-summary-num">{stats.totalCount}</span>
          <span className="fp-summary-label">次检查</span>
        </div>
        <div className="fp-summary-divider" />
        <div className="fp-summary-item">
          <span className="fp-summary-num" style={{ color: dotColor(stats.avgQuality - 5) }}>
            {stats.avgQuality}
          </span>
          <span className="fp-summary-label">平均质量 / 9</span>
        </div>
        <div className="fp-summary-divider" />
        <div className="fp-summary-item">
          <span className="fp-summary-num" style={{ color: symptomRate >= 50 ? '#c25070' : '#28904a' }}>
            {symptomRate}%
          </span>
          <span className="fp-summary-label">症状出现率</span>
        </div>
      </div>

      {/* ② 决策质量折线图（Recharts，与全景舱同款轴设计） */}
      <div className="fp-section">
        <div className="fp-section-header">
          <p className="fp-section-title">决策质量趋势</p>
          <div className="fp-chart-legend">
            <span style={{ color: '#28904a' }}>● 7–9 良好</span>
            <span style={{ color: '#c86028' }}>● 5–6 中等</span>
            <span style={{ color: '#6b8fad' }}>● 3–4 偏低</span>
            <span style={{ color: '#c25070' }}>● 1–2 疲劳</span>
          </div>
        </div>
        <div className="fp-chart-wrap">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart
              data={stats.days}
              margin={{ top: 8, right: 16, left: 4, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e8e4df" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#9a9088' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[-4, 4]}
                ticks={yTicks}
                width={40}
                tick={{ fontSize: 11, fill: '#9a9088' }}
                tickFormatter={yTickLabel}
                axisLine={false}
                tickLine={false}
              />
              {/* 基准线：y=0 对应质量 5 分 */}
              <ReferenceLine
                y={0}
                stroke="#9ca3af"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                label={{ value: '基准 5分', position: 'insideTopRight', fontSize: 10, fill: '#9ca3af' }}
              />
              <Tooltip
                content={({ active: on, payload }) => {
                  if (!on || !payload?.length) return null
                  const p = payload[0].payload as FatiguePoint
                  const symsText = p.symptoms > 0 ? `· ${p.symptoms.toFixed(1)} 个症状` : '· 无症状'
                  return (
                    <div className="chart-tooltip">
                      <p className="chart-tooltip__time">{p.date}</p>
                      <p><strong>质量均值 {p.quality} 分</strong></p>
                      <p style={{ color: '#9a9088', fontSize: '0.75rem' }}>
                        {p.count} 次检查 · 主要负荷：{p.load} {symsText}
                      </p>
                    </div>
                  )
                }}
              />
              <Line
                type="monotone"
                dataKey="mapped"
                stroke="#6b8fad"
                strokeWidth={2}
                dot={(props) => {
                  const { cx, cy, payload } = props as { cx: number; cy: number; payload: FatiguePoint }
                  if (cx == null || cy == null) return <g />
                  return (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={5}
                      fill={dotColor(payload.mapped)}
                      stroke="#fffcfa"
                      strokeWidth={2}
                    />
                  )
                }}
                activeDot={{ r: 7, stroke: '#3d4549', strokeWidth: 2, fill: '#fffcfa' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ③ 决策负荷分布 */}
      <div className="fp-section">
        <p className="fp-section-title">决策负荷分布</p>
        <StatRow label="少" count={stats.loadCounts['少']} total={stats.totalCount} color="#4c6898" />
        <StatRow label="正常" count={stats.loadCounts['正常']} total={stats.totalCount} color="#6b8f9e" />
        <StatRow label="极多" count={stats.loadCounts['极多']} total={stats.totalCount} color="#c86028" />
      </div>

      {/* ④ 疲劳症状频率 */}
      <div className="fp-section">
        <p className="fp-section-title">疲劳症状频率（共 {stats.totalCount} 次）</p>
        <StatRow label="犹豫不决" count={stats.symptomCounts.hesitate} total={stats.totalCount} color="#c25070" />
        <StatRow label="逃避倾向" count={stats.symptomCounts.escape} total={stats.totalCount} color="#c86028" />
        <StatRow label="脑雾" count={stats.symptomCounts.brainFog} total={stats.totalCount} color="#7b5ea7" />
      </div>
    </div>
  )
}
