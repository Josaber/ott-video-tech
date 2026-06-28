import { Chapter, L } from '../common'
import {
  CmsWorkflowFigure,
} from '../../figures'

export const chapter: Chapter = {
  slug: 'cms-editorial',
  title: 'CMS & editorial workflow',
  blurb: 'Metadata is a schema; the CMS is the workflow that fills it in and keeps it true.',
  render: () => (
    <>
      <p>
        The <L slug="metadata">Video metadata</L> chapter described <em>what</em> editorial
        fields exist. This chapter describes <em>how</em> they get filled in, edited,
        scheduled, and eventually removed — the operational layer behind every catalog.
        A real OTT runs a full editorial CMS that no end-user ever sees, but which any
        production engineer touches weekly.
      </p>

      <h3>Three ways content enters the catalog</h3>
      <ol>
        <li>
          <strong>CP feeds.</strong> Content providers (studios, distributors, syndicators)
          push XML or JSON manifests over SFTP / API on a schedule. Each feed describes
          episodes, rights windows, asset URLs, technical specs. Ingestion is mostly
          automated but always needs validation and human review for the first feed of a
          new partner.
        </li>
        <li>
          <strong>Direct upload.</strong> Internal editorial teams (originals, marketing,
          promos) upload through the CMS UI, fill in fields manually, attach assets.
        </li>
        <li>
          <strong>Programmatic creation.</strong> User-generated content, podcasts, news
          clips arriving via auto-ingest pipelines that create catalog entries with minimal
          metadata.
        </li>
      </ol>

      <h3>The lifecycle</h3>
      <div className="docs-figure">
        <CmsWorkflowFigure />
      </div>
      <ol>
        <li>
          <strong>Draft.</strong> Editor creates an entry, attaches mezzanine reference,
          fills in title / synopsis / cast / images. Auto-saved every keystroke. Visible
          only to the editorial team.
        </li>
        <li>
          <strong>Review.</strong> Submitted for QC + legal + localization checks. Failed
          reviews go back to Draft with comments. Approved entries unlock scheduling.
        </li>
        <li>
          <strong>Scheduled.</strong> Rights window assigned (e.g. <code>active_from
          2026-09-01T00:00Z</code>, <code>active_until 2027-08-31T23:59Z</code>). The
          catalog enforces the window — even though the row exists, it's invisible to users
          outside it.
        </li>
        <li>
          <strong>Live.</strong> Inside the rights window; visible in the catalog. CMS
          tracks views, ratings, edits to keep the entry up-to-date.
        </li>
        <li>
          <strong>Hidden.</strong> Soft-removed for incident response (DMCA complaint,
          controversy, technical break) or A/B test exclusion. Can return to Live.
        </li>
        <li>
          <strong>Archived.</strong> Rights expired or content retired. Row preserved for
          history (subscriptions, watch history) but the streamable assets may be deleted
          from origin to save cost.
        </li>
      </ol>

      <h3>Rights windows — the source of catalog churn</h3>
      <p>
        A single episode might have separate rights windows per country, per language, per
        platform, per device tier. Modeling this naively as a list per asset works; modeling
        it as <strong>rights × asset</strong> with a query layer that selects the applicable
        window at request time scales.
      </p>
      <ul>
        <li>
          <strong>Activation</strong> at the start of a window is event-driven: a cron sweeps
          assets crossing <code>active_from</code>, emits Kafka events, downstream caches
          invalidate, CDN warms. Same for deactivation at <code>active_until</code>.
        </li>
        <li>
          <strong>Geo restrictions</strong> are part of the window: a movie can be licensed
          in the US but not Canada in the same calendar window. The catalog API needs to
          return per-region availability.
        </li>
        <li>
          <strong>Renewals and gaps</strong>: a window may be renewed mid-stream, or have a
          gap (US: Jan-Jun, then nothing, then Sep-Dec). Watch history must survive gaps
          without orphaning the user's resume position.
        </li>
      </ul>

      <h3>Takedown — the most stress-tested CMS flow</h3>
      <p>
        When a piece of content has to come down <em>now</em> — DMCA, legal injunction, content
        breach — the CMS must:
      </p>
      <ul>
        <li>flip the asset to Hidden across <em>every</em> region within minutes;</li>
        <li>purge CDN caches so already-fetched manifests stop loading new segments;</li>
        <li>kill in-flight playback sessions (License Server stops issuing fresh keys);</li>
        <li>preserve audit trail of who pulled it, when, why.</li>
      </ul>
      <p>
        This is the path that is almost never exercised in normal operation and yet must
        work end-to-end on the worst possible day. Real platforms drill it quarterly.
      </p>

      <h3>Audit trail</h3>
      <p>
        Every CMS edit is logged: who, when, before/after, reason. This is non-negotiable in
        regulated markets (rights audits, regulatory inquiries) and routinely lifesaving in
        unregulated ones ("who scheduled that to go live at 3 AM?"). The audit log usually
        lives next to the catalog rows but in an append-only store (Postgres logical
        replication into a separate audit DB, or a Kafka topic into a warehouse).
      </p>

      <h3>What this demo skips entirely</h3>
      <p>
        The demo's editorial layer is just <code>title</code> and <code>description</code>
        on <code>VideoAssetEntity</code>, with no workflow, no rights window, no audit, no
        state machine. A real CMS is one of the larger backend surfaces of an OTT and is
        listed in the <L slug="gaps">production gaps</L>.
      </p>
    </>
  ),
}
