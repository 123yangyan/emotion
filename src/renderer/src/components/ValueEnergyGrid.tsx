import { getQuadrantLabel } from '../utils/entryParse'

interface Props {
  /** 价值感坐标 -4（排斥）~ +4（愉悦） */
  coordX: number
  /** 耗能度坐标 -4（轻松）~ +4（极耗），正值在格子上方 */
  coordY: number
  /** 是否已有落点选择 */
  hasSelection: boolean
  onPick: (x: number, y: number) => void
}

/**
 * 2D 坐标点选格子。
 * X 轴：左=排斥(-4)，右=愉悦(+4)
 * Y 轴：上=高耗能(+4)，下=轻松(-4)
 */
export default function ValueEnergyGrid({ coordX, coordY, hasSelection, onPick }: Props): JSX.Element {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    const rect = e.currentTarget.getBoundingClientRect()
    const relX = (e.clientX - rect.left) / rect.width
    const relY = (e.clientY - rect.top) / rect.height
    // relX 0→1 映射到 -4→+4；relY 0（顶部）→1（底部）映射到 +4→-4
    const x = Math.round((relX - 0.5) * 8)
    const y = Math.round((0.5 - relY) * 8)
    onPick(Math.max(-4, Math.min(4, x)), Math.max(-4, Math.min(4, y)))
  }

  // 落点在格子中的百分比位置
  const dotLeft = `${((coordX + 4) / 8) * 100}%`
  const dotTop = `${((4 - coordY) / 8) * 100}%`

  const label = hasSelection ? getQuadrantLabel(coordX, coordY) : ''
  const coordStr = hasSelection
    ? `(${coordX > 0 ? `+${coordX}` : coordX}, ${coordY > 0 ? `+${coordY}` : coordY})`
    : ''

  return (
    <div className="veg-wrapper">
      {/* Y 轴标签（左侧竖排，上=高耗能，下=轻松） */}
      <div className="veg-ylabels" aria-hidden>
        <span className="veg-ylabel veg-ylabel--top">高耗能</span>
        <span className="veg-ylabel veg-ylabel--bottom">轻松</span>
      </div>

      {/* 右侧主体：格子 + X轴标签 */}
      <div className="veg-main">
        <div
          className="veg-grid"
          role="button"
          tabIndex={0}
          aria-label="点击选择任务价值与耗能坐标"
          onClick={handleClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onPick(0, 0)
            }
          }}
        >
          {/* 四象限背景色块 */}
          <div className="veg-quadrant veg-quadrant--tl" aria-hidden>
            <span className="veg-quadrant__name">内耗陷阱</span>
          </div>
          <div className="veg-quadrant veg-quadrant--tr" aria-hidden>
            <span className="veg-quadrant__name">攻坚区</span>
          </div>
          <div className="veg-quadrant veg-quadrant--bl" aria-hidden>
            <span className="veg-quadrant__name">机械区</span>
          </div>
          <div className="veg-quadrant veg-quadrant--br" aria-hidden>
            <span className="veg-quadrant__name">心流区</span>
          </div>

          {/* 十字中轴线 */}
          <div className="veg-axis veg-axis--h" aria-hidden />
          <div className="veg-axis veg-axis--v" aria-hidden />

          {/* 当前落点 */}
          {hasSelection && (
            <div
              className="veg-dot"
              style={{ left: dotLeft, top: dotTop }}
              aria-label={`落点：${label} ${coordStr}`}
            />
          )}
        </div>

        {/* X 轴标签 */}
        <div className="veg-xlabels">
          <span className="veg-xlabel veg-xlabel--left">← 排斥</span>
          <span className="veg-xlabel veg-xlabel--right">愿意 →</span>
        </div>
      </div>

      {/* 象限名标签：始终占位（防止选择时格子上跳），有选择时才显示文字 */}
      <p className="veg-label" aria-live="polite">
        {hasSelection && <strong>{label}</strong>}
        {hasSelection && <span className="hint">&nbsp;{coordStr}</span>}
      </p>
    </div>
  )
}
