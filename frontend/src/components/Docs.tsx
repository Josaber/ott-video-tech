import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { CHAPTERS } from './docs/chapters'
import { Chapter } from './docs/common'
import { PARTS, READING_MINUTES, READING_ORDER, SEE_ALSO } from './docs/metadata'

/**
 * In-app docs: 6 parts × 45 chapters of OTT background reading. Chapter
 * CONTENT lives in `docs/chapters/<slug>.tsx`; reading-order / cross-
 * reference / read-time tables live in `docs/metadata.ts`. This file is
 * just the renderer + URL-hash routing.
 */

const CHAPTERS_BY_SLUG: Record<string, Chapter> = Object.fromEntries(
  CHAPTERS.map((c) => [c.slug, c]),
)

function readHashSlug(): string {
  const m = /^#\/docs\/([\w-]+)/.exec(window.location.hash)
  if (m && CHAPTERS_BY_SLUG[m[1]]) return m[1]
  return READING_ORDER[0]
}

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']

export function Docs() {
  const [activeSlug, setActiveSlug] = useState<string>(readHashSlug)

  useEffect(() => {
    if (window.location.hash !== `#/docs/${activeSlug}`) {
      window.history.replaceState(null, '', `#/docs/${activeSlug}`)
    }
  }, [activeSlug])

  useEffect(() => {
    const onHash = () => setActiveSlug(readHashSlug())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const ch = CHAPTERS_BY_SLUG[activeSlug] ?? CHAPTERS_BY_SLUG[READING_ORDER[0]]
  const idx = READING_ORDER.indexOf(activeSlug)
  const prevSlug = idx > 0 ? READING_ORDER[idx - 1] : null
  const nextSlug = idx >= 0 && idx < READING_ORDER.length - 1 ? READING_ORDER[idx + 1] : null
  const prev = prevSlug ? CHAPTERS_BY_SLUG[prevSlug] : null
  const next = nextSlug ? CHAPTERS_BY_SLUG[nextSlug] : null

  return (
    <div className="docs-layout">
      <aside className="docs-toc">
        {PARTS.map((part, partIdx) => (
          <div className="docs-toc-part" key={part.name}>
            <div className="docs-toc-part-label">
              <span className="docs-toc-part-num">PART {ROMAN[partIdx] ?? String(partIdx + 1)}</span>
              <span className="docs-toc-part-name">{part.name}</span>
            </div>
            <ol>
              {part.slugs.map((slug) => {
                const c = CHAPTERS_BY_SLUG[slug]
                if (!c) return null
                const overallIdx = READING_ORDER.indexOf(slug)
                return (
                  <li key={slug} className={slug === activeSlug ? 'active' : ''}>
                    <button onClick={() => setActiveSlug(slug)}>
                      <span className="docs-toc-num">
                        {String(overallIdx + 1).padStart(2, '0')}
                      </span>
                      <span className="docs-toc-title">{c.title}</span>
                    </button>
                  </li>
                )
              })}
            </ol>
          </div>
        ))}
      </aside>
      <article className="docs-content panel">
        <div className="docs-chapter-eyebrow">
          Chapter {idx + 1} of {READING_ORDER.length}
          {READING_MINUTES[ch.slug] ? <> · ~{READING_MINUTES[ch.slug]} min read</> : null}
        </div>
        <h1 className="docs-chapter-title">{ch.title}</h1>
        <p className="docs-chapter-blurb">{ch.blurb}</p>
        <div className="docs-prose">{ch.render()}</div>
        {SEE_ALSO[ch.slug] && SEE_ALSO[ch.slug].length > 0 && (
          <div className="docs-see-also">
            <span className="docs-see-also-label">SEE ALSO</span>
            {SEE_ALSO[ch.slug].map((s, i) => {
              const c = CHAPTERS_BY_SLUG[s]
              if (!c) return null
              return (
                <span key={s} className="docs-see-also-item">
                  {i > 0 && <span className="docs-see-also-sep">·</span>}
                  <button onClick={() => setActiveSlug(s)}>{c.title}</button>
                </span>
              )
            })}
          </div>
        )}
        <nav className="docs-pager">
          {prev ? (
            <button
              className="secondary docs-pager-link"
              onClick={() => setActiveSlug(prev.slug)}
            >
              <ChevronLeft size={14} />
              <span>
                <span className="docs-pager-dir">Previous</span>
                <span className="docs-pager-title">{prev.title}</span>
              </span>
            </button>
          ) : (
            <span />
          )}
          {next ? (
            <button
              className="secondary docs-pager-link docs-pager-link-right"
              onClick={() => setActiveSlug(next.slug)}
            >
              <span>
                <span className="docs-pager-dir">Next</span>
                <span className="docs-pager-title">{next.title}</span>
              </span>
              <ChevronRight size={14} />
            </button>
          ) : (
            <span />
          )}
        </nav>
      </article>
    </div>
  )
}
