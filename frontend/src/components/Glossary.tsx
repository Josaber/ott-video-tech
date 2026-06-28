import { GROUPS } from './glossary.data'

/**
 * Renders the OTT-terms glossary inside the Docs view. Pure presentation
 * — content lives in {@link ./glossary.data.ts} so it can grow without
 * pushing this file past 300 lines.
 */
export function Glossary() {
  return (
    <div className="glossary-wrap">
      {GROUPS.map((g) => (
        <section className="glossary-section" key={g.label}>
          <h3 className="glossary-section-title">
            {g.label}
            <span className="glossary-section-count">{g.items.length}</span>
          </h3>
          <dl className="glossary">
            {g.items.map((t) => (
              <div className="glossary-row" key={t.abbr}>
                <dt>
                  <span className="glossary-abbr">{t.abbr}</span>
                  <span className="glossary-full">{t.full}</span>
                </dt>
                <dd>{t.note}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  )
}
