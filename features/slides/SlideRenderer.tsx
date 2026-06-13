import type { DeckTheme, Slide } from '@/lib/slides/types'

import './slides.css'

interface SlideRendererProps {
  slide: Slide
  theme: DeckTheme
  index?: number
  total?: number
}

/**
 * Renders one Slide by layout into a 16:9 themed frame. Pure + first-party
 * (no sandbox) — type scales via container queries, so the same component is
 * used for the main stage and the thumbnail rail.
 */
export function SlideRenderer({ slide, theme, index, total }: SlideRendererProps) {
  const pageNum = index != null && total != null && slide.layout !== 'title' && slide.layout !== 'closing'

  return (
    <div className={`deck-slide deck-theme-${theme} deck-pad ${center(slide.layout) ? 'deck-center' : ''}`}>
      {renderBody(slide)}
      {pageNum ? <span className="s-pagenum">{(index ?? 0) + 1} / {total}</span> : null}
    </div>
  )
}

function center(layout: Slide['layout']): boolean {
  return layout === 'title' || layout === 'section' || layout === 'quote' || layout === 'closing'
}

function renderBody(slide: Slide) {
  switch (slide.layout) {
    case 'title':
      return (
        <div>
          {slide.eyebrow ? <div className="s-eyebrow" style={{ marginBottom: '3cqw' }}>{slide.eyebrow}</div> : null}
          <h1 className="s-title-lg" style={{ maxWidth: '22ch' }}>{slide.title}</h1>
          {slide.subtitle ? <p className="s-subtitle" style={{ marginTop: '3cqw', maxWidth: '40ch' }}>{slide.subtitle}</p> : null}
          <div className="s-rule" style={{ marginTop: '4cqw' }} />
        </div>
      )

    case 'section':
      return (
        <div>
          {slide.eyebrow ? <div className="s-kicker" style={{ marginBottom: '2.5cqw' }}>{slide.eyebrow}</div> : null}
          <div className="s-rule" style={{ marginBottom: '3cqw' }} />
          <h2 className="s-title" style={{ maxWidth: '20ch' }}>{slide.title}</h2>
          {slide.subtitle ? <p className="s-subtitle" style={{ marginTop: '2.5cqw', maxWidth: '40ch' }}>{slide.subtitle}</p> : null}
        </div>
      )

    case 'quote':
      return (
        <div>
          <blockquote className="s-quote" style={{ maxWidth: '24ch' }}>“{slide.quote?.text}”</blockquote>
          {slide.quote?.author ? <div className="s-subtitle" style={{ marginTop: '3.5cqw' }}>— {slide.quote.author}</div> : null}
        </div>
      )

    case 'stat':
      return (
        <div>
          {slide.title ? <h3 className="s-title" style={{ fontSize: '4.4cqw', maxWidth: '24ch' }}>{slide.title}</h3> : null}
          <div style={{ marginTop: '5cqw', display: 'grid', gridTemplateColumns: `repeat(${Math.min(slide.stats.length || 1, 4)}, 1fr)`, gap: '5cqw' }}>
            {slide.stats.map((s, i) => (
              <div key={i}>
                <div className="s-stat-value">{s.value}</div>
                <div className="s-stat-label" style={{ marginTop: '1.5cqw', maxWidth: '18ch' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )

    case 'two-column':
      return (
        <div>
          {slide.eyebrow ? <div className="s-eyebrow" style={{ marginBottom: '2cqw' }}>{slide.eyebrow}</div> : null}
          {slide.title ? <h3 className="s-title" style={{ fontSize: '4.6cqw', marginBottom: '4cqw', maxWidth: '24ch' }}>{slide.title}</h3> : null}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(slide.columns.length || 2, 3)}, 1fr)`, gap: '5cqw' }}>
            {slide.columns.map((c, i) => (
              <div key={i}>
                <div className="s-col-head">{c.heading}</div>
                <p className="s-body" style={{ marginTop: '1.8cqw', color: 'var(--slide-muted)' }}>{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      )

    case 'closing':
      return (
        <div>
          {slide.eyebrow ? <div className="s-eyebrow" style={{ marginBottom: '3cqw' }}>{slide.eyebrow}</div> : null}
          <h2 className="s-title-lg" style={{ fontSize: '7cqw', maxWidth: '20ch' }}>{slide.title}</h2>
          {slide.subtitle ? <p className="s-subtitle" style={{ marginTop: '3cqw', maxWidth: '40ch' }}>{slide.subtitle}</p> : null}
        </div>
      )

    case 'bullets':
    default:
      return (
        <div>
          {slide.eyebrow ? <div className="s-eyebrow" style={{ marginBottom: '2cqw' }}>{slide.eyebrow}</div> : null}
          {slide.title ? <h3 className="s-title" style={{ fontSize: '4.8cqw', maxWidth: '24ch' }}>{slide.title}</h3> : null}
          {slide.body ? <p className="s-body" style={{ marginTop: '2.5cqw', maxWidth: '44ch', color: 'var(--slide-muted)' }}>{slide.body}</p> : null}
          {slide.bullets.length ? (
            <ul style={{ marginTop: '4cqw', display: 'flex', flexDirection: 'column', gap: '2.4cqw' }}>
              {slide.bullets.map((b, i) => (
                <li key={i} style={{ display: 'flex', gap: '2.2cqw', maxWidth: '50ch' }}>
                  <span className="s-marker" />
                  <span className="s-bullet">{b}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      )
  }
}
