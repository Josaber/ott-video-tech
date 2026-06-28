import { Chapter } from '../common'
import {
  HomeRailsFigure,
} from '../../figures'

export const chapter: Chapter = {
  slug: 'catalog',
  title: 'Catalog & recommendations',
  blurb: 'The rail-based home page, content vs collaborative filtering, A/B testing video.',
  render: () => (
    <>
      <p>
        Encoded bytes plus a manifest is the necessary condition for streaming, not the
        sufficient one. The viewer needs to find something to watch. Catalog UX and
        recommendations are how production OTT closes that loop.
      </p>
      <h3>The rail-based home page</h3>
      <p>
        Netflix popularised it; everyone copied it. The home page is a vertical list of
        horizontal <strong>rails</strong>, each rail a curated or algorithmically-ranked
        selection of titles. The interaction model: pan along a rail, drop down to the next.
      </p>
      <div className="docs-figure">
        <HomeRailsFigure />
      </div>
      <p>Common rail types:</p>
      <ul>
        <li><strong>Continue watching</strong> — partially-watched titles with the resume position. Universally first.</li>
        <li><strong>Because you watched X</strong> — content-based similarity from a recent watch.</li>
        <li><strong>Trending now</strong> — global popularity, recency-decayed.</li>
        <li><strong>New releases</strong> — editorial-curated or window-based.</li>
        <li><strong>Genre rails</strong> — explicit category, often expanded into sub-genres.</li>
        <li><strong>For you</strong> — personalised collaborative-filtering output.</li>
        <li><strong>Sponsored / featured</strong> — promoted, paid placement.</li>
      </ul>
      <h3>Recommendation systems</h3>
      <ul>
        <li><strong>Content-based.</strong> Vector similarity over program metadata (genre, cast, year, mood embeddings). Works for cold-start titles. Misses surprising connections.</li>
        <li><strong>Collaborative filtering.</strong> Matrix factorisation on watch history: "viewers who watched A also watched B". Strongest with lots of overlap; cold-starts poorly for new titles or new viewers.</li>
        <li><strong>Hybrid + multi-stage.</strong> Production systems retrieve candidates with a fast model, rerank with a heavier one, post-process for diversity and freshness.</li>
        <li><strong>Sequence models.</strong> Treat watch history as a token sequence; predict the next title with a transformer. State of the art at YouTube and TikTok-style apps.</li>
      </ul>
      <h3>Personalisation signals</h3>
      <p>
        Beyond explicit watch / not-watch: completion rate, dwell time on the title card,
        time-of-day, device, language preference, search history, household profile (kid vs
        adult). Most regulators treat watch history as personal data under GDPR / CCPA.
      </p>
      <h3>A/B testing video</h3>
      <p>
        Netflix's famous thumbnail tests: different artwork per title per cohort, measure
        click-through and play-rate. Same applies to:
      </p>
      <ul>
        <li>Auto-play preview on hover vs no preview.</li>
        <li>Preroll trailer vs landing on the title page.</li>
        <li>Rail ordering on the home page.</li>
        <li>Search ranking signals.</li>
      </ul>
      <p>
        Every test has a "stop the bleeding" guard rail — if completion rate drops 10% in
        treatment, kill it immediately.
      </p>
      <h3>Editorial curation</h3>
      <p>
        Algorithms can't yet match a human editor for the front rail of a launch week. Most
        catalogs blend automation with a small editorial team that owns the home page hero,
        the trending rail seeding, and seasonal collections (Halloween, World Cup, holiday).
      </p>
    </>
  ),
}
