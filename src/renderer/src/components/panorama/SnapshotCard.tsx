import type { CSSProperties } from 'react'

import type { PanoramaPoint } from '../../utils/panoramaAnalytics'

import { splitThought } from '../../utils/historyRowPreview'

import { ZH } from '../../i18n/zh'

import { formatDateTime } from '../../utils/formatTime'



interface Props {

  point: PanoramaPoint

  thoughtTagOptions: string[]

  navIndex: number

  navTotal: number

  canPrev: boolean

  canNext: boolean

  onPrev: () => void

  onNext: () => void

  onClose: () => void

  onEdit?: () => void

}



type ContentColumn = 'fact' | 'thought'



/** 点击峰值后的「当时当地」切片卡片 */

export default function SnapshotCard({

  point,

  thoughtTagOptions,

  navIndex,

  navTotal,

  canPrev,

  canNext,

  onPrev,

  onNext,

  onClose,

  onEdit

}: Props): JSX.Element {

  const { tags: thoughtTags, quote: thoughtQuote } = splitThought(

    point.thoughtRaw,

    thoughtTagOptions

  )

  const hasThoughtText = thoughtQuote.trim().length > 0

  const hasFact = point.factTags.length > 0 || point.factSupplement.trim().length > 0

  const hasThought = thoughtTags.length > 0 || hasThoughtText



  const visibleColumns: ContentColumn[] = []

  if (hasFact) visibleColumns.push('fact')

  if (hasThought) visibleColumns.push('thought')



  const heroStyle = {

    '--snapshot-hero-color': point.valenceColor

  } as CSSProperties



  const gridStyle = {

    '--snapshot-cols': visibleColumns.length

  } as CSSProperties



  return (

    <section

      className="panorama-snapshot"

      aria-label={ZH.panoramaSnapshotTitle}

      aria-live="polite"

    >

      <header className="panorama-snapshot__head">

        <div className="panorama-snapshot__title-block">

          <h3>{ZH.panoramaSnapshotTitle}</h3>

          <time className="panorama-snapshot__time">{formatDateTime(point.occurredAt)}</time>

        </div>

        <div className="panorama-snapshot__toolbar">

          {navTotal > 1 ? (

            <div className="panorama-snapshot__nav" aria-label={ZH.panoramaSnapshotNavLabel}>

              <button

                type="button"

                className="panorama-snapshot__nav-btn"

                disabled={!canPrev}

                onClick={onPrev}

                aria-label={ZH.panoramaSnapshotPrev}

              >

                ‹

              </button>

              <span className="panorama-snapshot__nav-count">

                {ZH.panoramaSnapshotNav(navIndex + 1, navTotal)}

              </span>

              <button

                type="button"

                className="panorama-snapshot__nav-btn"

                disabled={!canNext}

                onClick={onNext}

                aria-label={ZH.panoramaSnapshotNext}

              >

                ›

              </button>

            </div>

          ) : null}

          {onEdit ? (

            <button type="button" className="panorama-snapshot__edit" onClick={onEdit}>

              {ZH.panoramaSnapshotEdit}

            </button>

          ) : null}

          <button type="button" className="panorama-snapshot__close" onClick={onClose}>

            {ZH.panoramaSnapshotClose}

          </button>

        </div>

      </header>



      <div className="panorama-snapshot__hero" style={heroStyle}>

        <span className="panorama-snapshot__hero-intensity">

          {ZH.panoramaSnapshotHeroIntensity(point.intensity)}

        </span>

        <span className="panorama-snapshot__hero-sep" aria-hidden>

          ·

        </span>

        <span className="panorama-snapshot__hero-emotion">{point.emotionLabels}</span>

      </div>



      {visibleColumns.length > 0 ? (

        <div className="panorama-snapshot__grid" style={gridStyle}>

          {hasFact ? (

            <div className="panorama-snapshot__col">

              <h4 className="panorama-snapshot__col-title">{ZH.objectiveFact}</h4>

              {point.factTags.length > 0 ? (

                <div className="chip-wrap panorama-snapshot__chips">

                  {point.factTags.map((tag) => (

                    <span key={tag} className="chip sm scene">

                      {tag}

                    </span>

                  ))}

                </div>

              ) : null}

              {point.factSupplement ? (

                <p className="panorama-snapshot__supplement">"{point.factSupplement}"</p>

              ) : null}

            </div>

          ) : null}



          {hasThought ? (

            <div className="panorama-snapshot__col">

              <h4 className="panorama-snapshot__col-title">{ZH.subjectiveThought}</h4>

              {thoughtTags.length > 0 ? (

                <div className="chip-wrap panorama-snapshot__chips">

                  {thoughtTags.map((tag) => (

                    <span key={tag} className="chip sm thought">

                      {tag}

                    </span>

                  ))}

                </div>

              ) : null}

              {hasThoughtText ? (

                <p className="panorama-snapshot__quote">"{thoughtQuote}"</p>

              ) : (

                <p className="panorama-snapshot__empty">{ZH.panoramaSnapshotNoThoughtText}</p>

              )}

            </div>

          ) : null}

        </div>

      ) : null}

    </section>

  )

}

