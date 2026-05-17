import type { PanoramaPoint } from '../../utils/panoramaAnalytics'
import { ZH } from '../../i18n/zh'
import { formatDateTime } from '../../utils/formatTime'

interface Props {
  point: PanoramaPoint
  onClose: () => void
}

/** 点击峰值后的「当时当地」切片卡片 */
export default function SnapshotCard({ point, onClose }: Props): JSX.Element {
  const narrative =
    point.thoughtParts.find((t) => t.length > 12) ??
    point.thoughtParts[point.thoughtParts.length - 1] ??
    point.thoughtRaw

  return (
    <section className="panorama-snapshot" aria-label={ZH.panoramaSnapshotTitle}>
      <header className="panorama-snapshot__head">
        <div>
          <h3>{ZH.panoramaSnapshotTitle}</h3>
          <time className="panorama-snapshot__time">{formatDateTime(point.occurredAt)}</time>
        </div>
        <button type="button" className="btn ghost panorama-snapshot__close" onClick={onClose}>
          {ZH.panoramaSnapshotClose}
        </button>
      </header>

      <p className="panorama-snapshot__narrative">{narrative || ZH.panoramaSnapshotNoThought}</p>

      <div className="panorama-snapshot__meta">
        <span className="panorama-snapshot__intensity">{ZH.intensityLabel(point.intensity)}</span>
        <span className="panorama-snapshot__emotion">{point.emotionLabels}</span>
      </div>

      <div className="panorama-snapshot__lanes">
        <div className="panorama-snapshot__lane">
          <span className="panorama-snapshot__lane-label">{ZH.objectiveFact}</span>
          <div className="chip-wrap">
            {point.factTags.map((tag) => (
              <span key={tag} className="chip sm scene snapshot-chip">
                {tag}
              </span>
            ))}
            {point.factSupplement ? (
              <span className="snapshot-note">{point.factSupplement}</span>
            ) : null}
          </div>
        </div>
        <div className="panorama-snapshot__lane">
          <span className="panorama-snapshot__lane-label">{ZH.subjectiveThought}</span>
          <div className="chip-wrap">
            {point.thoughtParts.map((tag) => (
              <span key={tag} className="chip sm thought snapshot-chip">
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="panorama-snapshot__lane">
          <span className="panorama-snapshot__lane-label">{ZH.bodyMind}</span>
          <div className="chip-wrap">
            {point.bodyParts.map((tag) => (
              <span key={tag} className="chip sm somatic snapshot-chip">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
