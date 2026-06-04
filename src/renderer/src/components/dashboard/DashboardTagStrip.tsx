import { ZH } from '../../i18n/zh'

interface Props {
  tags: string[]
}

/** 价值/耗能高频标签横向滚动 */
export default function DashboardTagStrip({ tags }: Props): JSX.Element | null {
  if (tags.length === 0) return null

  return (
    <section className="dashboard-v2__tags" aria-label={ZH.dashboardTagsTitle}>
      <h3 className="dashboard-v2__tags-title">{ZH.dashboardTagsTitle}</h3>
      <div className="dashboard-v2__tags-scroll">
        {tags.map((tag) => (
          <span key={tag} className="dashboard-v2__tag-chip">
            {tag}
          </span>
        ))}
      </div>
    </section>
  )
}
