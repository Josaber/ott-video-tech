import { Chapter } from '../common'
import {
  RecommendationCascadeFigure,
} from '../../figures'

export const chapter: Chapter = {
  slug: 'recommendation',
  title: 'Recommendation cascade',
  blurb: 'Recall → coarse rank → fine rank → rerank — the four-stage funnel every OTT shows you.',
  render: () => (
    <>
      <p>
        The home grid you see on Netflix, Disney+, or iQIYI is the output of an industrial
        recommendation pipeline. Every OTT of meaningful scale uses some variant of the same
        four-stage cascade: <strong>recall</strong> (pull a candidate set from millions),
        <strong>coarse rank</strong> (filter to a thousand), <strong>fine rank</strong>
        (rank the top hundred), <strong>rerank</strong> (the final twenty for the user). The
        shape is dictated by latency — you cannot fine-rank a million items in 100 ms.
      </p>

      <h3>The funnel</h3>
      <div className="docs-figure">
        <RecommendationCascadeFigure />
      </div>

      <h3>Stage 1 — Recall</h3>
      <p>
        Goal: from the full catalog (50 K-500 K items at OTT scale), surface a candidate set
        of ~10 K that is <em>likely</em> to contain the items the user will engage with.
        Speed-over-precision: most candidates will be wrong, but recall must be high.
      </p>
      <ul>
        <li>
          <strong>Vector recall.</strong> Embed user and items into the same vector space
          (DSSM / two-tower model trained offline), then nearest-neighbor search via
          <strong> Milvus</strong> / Faiss for the user vector. K=2000-5000 candidates.
        </li>
        <li>
          <strong>Collaborative filtering.</strong> "Users who watched X also watched Y" —
          still useful for popular long-tail recall.
        </li>
        <li>
          <strong>Hot / editorial.</strong> Curated promo positions, today's hot list, new
          releases. Always include some so editorial control survives the model.
        </li>
        <li>
          <strong>Recent-watch + sequel.</strong> If you watched S01E03 of "Show X", S01E04
          jumps directly into the candidate set.
        </li>
      </ul>

      <h3>Stage 2 — Coarse rank</h3>
      <p>
        Goal: score the ~10 K candidates with a cheap model and keep the top 1000. The
        cheap model is usually a <strong>DSSM</strong> (Deep Structured Semantic Model) two-tower
        — user features go through one tower, item features through another, the dot product
        is the score. Both towers are pre-computed; only the dot product runs at request time.
        Runs on Triton / TF Serving with hundreds of QPS per box.
      </p>

      <h3>Stage 3 — Fine rank</h3>
      <p>
        Goal: precisely score the top 1000 with an expensive model, keep the top 100.
        Expensive means features are computed at request time per (user, item) pair — attention
        over watch history, sequence models, cross features. Architectures: <strong>DIN</strong>
        (Deep Interest Network), <strong>SIM</strong> (Search-based Interest Model), DCN,
        MMoE. Latency budget: 30-60 ms for the batch.
      </p>

      <h3>Stage 4 — Rerank</h3>
      <p>
        Goal: produce the final list (10-30 items) optimizing more than CTR. Concerns the
        first three stages can't model directly:
      </p>
      <ul>
        <li>
          <strong>Diversity.</strong> Don't show ten action movies in a row.
        </li>
        <li>
          <strong>Multi-objective.</strong> Balance click probability, watch-time, retention,
          subscription likelihood.
        </li>
        <li>
          <strong>Exploration.</strong> Insert a few items from undertrained categories so the
          model keeps learning what the user likes.
        </li>
        <li>
          <strong>Business rules.</strong> "Promote this Original this week", "demote content
          in regional cooldown", "respect parental controls", "remove items the user just
          finished".
        </li>
      </ul>

      <h3>Feature store</h3>
      <p>
        Every stage above consumes <strong>features</strong>: counts of past actions, time
        since last watch, embedding vectors, demographic tags. These come from a
        <strong> feature store</strong> with two halves that must agree:
      </p>
      <ul>
        <li>
          <strong>Offline half</strong> — Spark / Flink computes features over days of logs;
          written to a parquet warehouse. Used by training to produce model weights.
        </li>
        <li>
          <strong>Online half</strong> — Redis / Cassandra / a feature-store like Feast that
          serves features at request time. Updated continuously from Flink / Kafka.
        </li>
      </ul>
      <p>
        The cardinal sin is <strong>training-serving skew</strong> — features computed
        differently online vs offline. Models trained on one feature distribution and served
        on another silently degrade. A feature store is the contract that prevents skew.
      </p>

      <h3>Cold start</h3>
      <ul>
        <li>
          <strong>New user.</strong> No history → fall back to editorial hot list, popularity
          within the user's region, plus an onboarding question ("pick three you've watched").
          User vector is randomly initialized and updated by first sessions.
        </li>
        <li>
          <strong>New item.</strong> No interaction data → use content features (cast, genre,
          embeddings derived from the trailer / poster / synopsis). The CV chapter is upstream
          here: scene embeddings let new content immediately enter recall pools.
        </li>
      </ul>

      <h3>Training cadence</h3>
      <ul>
        <li>
          <strong>Embedding models</strong> — retrained nightly or every few days on a
          week of logs. Vector index rebuilt + hot-swapped in Milvus.
        </li>
        <li>
          <strong>Ranking models</strong> — retrained weekly; champion / challenger A/B
          decides promotion. <strong>Online learning</strong> can update the last layer hourly
          for fast adaptation (regional events, new releases).
        </li>
        <li>
          <strong>Bandits</strong> — exploration weights tuned continuously based on
          reward signals.
        </li>
      </ul>

      <h3>What this demo doesn't have</h3>
      <p>
        The demo has no recommendation pipeline at all — the assets list is the catalog and
        uses insertion order. The architecture in <code>/docs/vod-architecture.md</code> §三
        shows the production shape; everything above is what would sit between the catalog
        DB and the home grid.
      </p>
    </>
  ),
}
