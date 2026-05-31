import { useState } from 'react'
import type { PanoramaPoint } from '../../utils/panoramaAnalytics'
import { extractDrainPoints, topFactTags, calcNetEnergy } from '../../utils/panoramaAnalytics'
import { ZH } from '../../i18n/zh'

interface Props {
  points: PanoramaPoint[]
}

/** 每周能量审计视图：内耗 Top3 + 净能量值 + 节能 SOP 填写 */
export default function EnergyAuditView({ points }: Props): JSX.Element {
  const drainPoints = extractDrainPoints(points)
  const top3 = topFactTags(drainPoints, 3)
  const netEnergy = calcNetEnergy(points)
  const [sops, setSops] = useState<string[]>(['', '', ''])

  const setSop = (idx: number, val: string): void => {
    setSops((prev) => {
      const next = [...prev]
      next[idx] = val
      return next
    })
  }

  return (
    <div className="energy-audit">
      {/* 净能量值 */}
      <div className="energy-audit__net-value">
        <span className="energy-audit__net-number">
          {netEnergy > 0 ? `+${netEnergy}` : netEnergy}
        </span>
        <div>
          <p className="energy-audit__section-title">{ZH.energyAuditNetTitle}</p>
          <p className="energy-audit__net-desc">
            {ZH.energyAuditNetDesc}
            {points.length > 0 ? `  ${ZH.energyAuditCount(points.length)}` : ''}
          </p>
        </div>
      </div>

      {/* 内耗 Top3 */}
      <div>
        <p className="energy-audit__section-title">{ZH.energyAuditTop3Title}</p>
        {top3.length === 0 ? (
          <p className="hint">{ZH.energyAuditTop3Empty}</p>
        ) : (
          <ul className="energy-audit__top3">
            {top3.map((item, idx) => (
              <li key={item.label} className="energy-audit__top3-item">
                <span className="energy-audit__top3-rank">#{idx + 1}</span>
                <span className="energy-audit__top3-label">{item.label}</span>
                <span className="energy-audit__top3-count">×{item.count}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 节能 SOP 填写（软引导，非强制） */}
      {top3.length > 0 && (
        <div>
          {top3.map((item, idx) => (
            <div key={item.label} style={{ marginBottom: 12 }}>
              <p className="energy-audit__section-title" style={{ fontSize: '0.82rem', marginBottom: 4 }}>
                {ZH.energyAuditSopLabel(idx + 1)}{item.label}
              </p>
              <textarea
                className="energy-audit__sop-area"
                value={sops[idx]}
                placeholder={ZH.energyAuditSopPlaceholder}
                onChange={(e) => setSop(idx, e.target.value)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
