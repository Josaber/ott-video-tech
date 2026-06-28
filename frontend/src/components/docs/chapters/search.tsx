import { Chapter } from '../common'
import {
  SearchPipelineFigure,
} from '../../figures'

export const chapter: Chapter = {
  slug: 'search',
  title: 'Search & discovery',
  blurb: 'Query, autocomplete, retrieval, rerank — the search box and its ranking signals.',
  render: () => (
    <>
      <p>
        Recommendations are how the home page surfaces content the viewer didn't ask for.{' '}
        <strong>Search</strong> is how they find what they did. Both live in the same
        discovery layer of the catalog — share the same metadata, the same personalisation
        signals — but search has a 100 ms latency budget end-to-end and has to be perfect
        on the first character.
      </p>
      <div className="docs-figure">
        <SearchPipelineFigure />
      </div>

      <h3>Query input</h3>
      <ul>
        <li><strong>Typed</strong> — keyboard, on-screen IME, mobile autocorrect.</li>
        <li><strong>Voice</strong> — phone mics, CTV remote with voice, smart-speaker integrations (Alexa, Google Home). ASR (Whisper / Google Speech / AWS Transcribe) → text → same pipeline.</li>
        <li><strong>Deep links</strong> — search-engine results pointing at <code>/search?q=loki</code>. Same pipeline, no UI keystroke.</li>
      </ul>

      <h3>Autocomplete</h3>
      <p>
        The dropdown that appears after the first character. Implemented with one of:
      </p>
      <ul>
        <li><strong>Edge n-grams</strong> in ElasticSearch — index every prefix of every title; query the user's prefix; return matches sorted by popularity.</li>
        <li><strong>Completion suggester</strong> — ES's <code>completion</code> field type, optimised for prefix lookup. Fast but rigid.</li>
        <li><strong>Algolia / Typesense</strong> — hosted search-as-a-service, autocomplete out of the box with typo tolerance.</li>
      </ul>

      <h3>Retrieval</h3>
      <p>
        The first-stage match: pull ~200 candidate titles for the query. Most teams build
        on <strong>ElasticSearch</strong> / <strong>OpenSearch</strong> with a BM25 index;
        some use <strong>Algolia</strong> hosted; a few build with <strong>Vespa</strong> for
        vector + lexical hybrid retrieval. Fields scored: title (boost ×5), cast and
        director (×2), synopsis (×1), keywords.
      </p>

      <h3>Rerank</h3>
      <p>
        The first-stage retrieval is fast but coarse. A second-stage model reranks the top
        100-200 candidates using richer signals: personalised similarity to the viewer's
        watch history, recency, regional availability, rights window. ML model (gradient
        boosting, LambdaRank) scores each candidate with the query as context.
      </p>

      <h3>Diversify</h3>
      <p>
        A pure relevance ranker often returns five seasons of the same show. <strong>MMR
        </strong> (Maximal Marginal Relevance) or simple per-program deduplication drops the
        near-duplicates and surfaces variety in the top 10.
      </p>

      <h3>Query understanding</h3>
      <ul>
        <li><strong>Typo tolerance</strong> — edit-distance-2 fuzzy match. ES <code>fuzziness: AUTO</code>.</li>
        <li><strong>Synonyms</strong> — "war movies" → action, drama, military, biographical. Curated synonym dictionaries.</li>
        <li><strong>Semantic expansion</strong> — embed the query, retrieve titles by vector similarity. Catches "movies about loneliness" hitting <em>Lost in Translation</em>.</li>
        <li><strong>Intent classification</strong> — distinguish "search for a title" vs "navigate to settings" vs "play".</li>
      </ul>
    </>
  ),
}
