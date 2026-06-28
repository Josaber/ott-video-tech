import { Chapter } from '../common'
import {
  EditorialHierarchyFigure,
} from '../../figures'

export const chapter: Chapter = {
  slug: 'metadata',
  title: 'Video metadata',
  blurb: 'The editorial layer above the bytes — programs, seasons, episodes, rights, identifiers.',
  render: () => (
    <>
      <p>
        Every OTT catalog has <strong>two metadata layers</strong>, and the technical chapters
        that follow only cover one. <strong>Technical</strong> metadata describes the bits:
        codec, container, bitrate, duration, GOP length, audio channel layout, captions
        available. <strong>Editorial</strong> metadata describes the work: a title, a synopsis,
        the cast, posters, the season and episode number, when the rights start, what countries
        it can play in, the maturity rating.
      </p>
      <p>
        This demo has almost none of the editorial layer — <code>VideoAssetEntity</code> stores
        only <code>title</code> and <code>description</code>. A real catalog model below.
      </p>

      <h3>Editorial hierarchy</h3>
      <div className="docs-figure">
        <EditorialHierarchyFigure />
      </div>
      <table className="docs-gaps">
        <thead>
          <tr>
            <th>Concept</th>
            <th>What it represents</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Brand</td>
            <td>A franchise umbrella — "Marvel Cinematic Universe", "James Bond", "Doctor Who". Holds multiple Programs that share a creative identity.</td>
          </tr>
          <tr>
            <td>Program (Title / Show)</td>
            <td>The top-level work. A single movie ("Dune Part Two") or an entire series ("Breaking Bad"). Holds Seasons or, for movies, the deliverable directly.</td>
          </tr>
          <tr>
            <td>Season</td>
            <td>A grouping of Episodes inside an episodic Program. Carries its own poster, release year, total-episode count.</td>
          </tr>
          <tr>
            <td>Episode</td>
            <td>Single installment inside a Season — referenced as S01E03. Has its own title, runtime, synopsis. The Asset / deliverable hangs off the Episode for series, off the Program for movies.</td>
          </tr>
          <tr>
            <td>Collection</td>
            <td>Curated, editorial — "Best Sci-Fi of 2025", "Christmas Classics". A flat list of Programs and Episodes assembled for merchandising, not for canonical structure.</td>
          </tr>
          <tr>
            <td>Asset / Deliverable</td>
            <td>A single playable item — what this demo calls an asset. Each Episode or Movie can have many: different cuts (theatrical vs director's), dubs, captions, aspect ratios. Same editorial entity, different bytes.</td>
          </tr>
        </tbody>
      </table>

      <h3>Identifiers</h3>
      <p>
        A program lives in multiple systems (your catalog, ad server, rights manager, analytics,
        social search). Identifiers stitch those together. The common ones:
      </p>
      <ul>
        <li><strong>EIDR</strong> — Entertainment Identifier Registry. DOI-based global ID, e.g. <code>10.5240/7D32-4B14-3C6A-2D52-FBC3-N</code>. The studios' canonical cross-system key.</li>
        <li><strong>Gracenote / TMS ID</strong> — broadcast-industry catalog provider; what EPG listings and many smart-TV apps use to identify a program.</li>
        <li><strong>IMDb ID</strong> — <code>tt0903747</code>. Useful for human-readable cross-reference, not a clearing identifier.</li>
        <li><strong>Internal UUID</strong> — what this demo's <code>VideoAssetEntity.id</code> is. Decoupled from any external ID so external systems can renumber without breaking your DB.</li>
      </ul>

      <h3>Rights & availability</h3>
      <p>
        Editorial metadata also includes the "can we play this, to whom, where, when" rules.
        The license server (or a content gateway in front of it) consults these before issuing
        a decryption key:
      </p>
      <ul>
        <li><strong>License windows.</strong> <code>availability_starts_at</code> + <code>availability_ends_at</code>. A right ends; the program disappears from the catalog or the play API returns 451.</li>
        <li><strong>Territory rules.</strong> Country allowlist / denylist per program (rights are sold per region). Enforced via IP geolocation; bypassed by VPN — hence the cat-and-mouse with VPN detection.</li>
        <li><strong>Platform restrictions.</strong> Some content is mobile-only, some CTV-only, some excludes set-top boxes. Driven by per-deal terms.</li>
        <li><strong>Maturity ratings.</strong> MPAA (US), BBFC (UK), FSK (DE), CSA (FR), GRAC (KR). Profile-level age gates and parental locks consult these.</li>
        <li><strong>Concurrent stream limit.</strong> Per account, often per plan tier. Enforced at license-issue time.</li>
      </ul>

      <h3>Exchange standards</h3>
      <p>
        Editorial metadata moves between studios, packagers and platforms in standardised
        envelopes:
      </p>
      <ul>
        <li><strong>CableLabs ADI 3.0</strong> — Asset Distribution Interface. XML sidecar that pairs with a mezzanine to deliver VOD ingest packages from studios to cable / OTT operators.</li>
        <li><strong>TV-Anytime</strong> — ETSI standard. Covers EPG, synopsis, ratings, parental controls.</li>
        <li><strong>EBUcore</strong> — broadcast-focused Dublin Core extension; common in European public broadcasters.</li>
        <li><strong>schema.org / VideoObject + JSON-LD</strong> — what gets emitted in <code>&lt;head&gt;</code> for SEO and what smart-TV launcher apps read to populate their home rails.</li>
      </ul>

      <h3>Editorial workflow</h3>
      <p>
        A typical ingest path: a studio drops a mezzanine plus an ADI XML or MovieLabs MMC
        package on an SFTP / S3 bucket. A validator parses the metadata, dedups against
        existing programs (by EIDR), maps fields to your internal schema, queues the mezzanine
        for transcode + packaging. Editorial review fills the gaps (curated synopsis, poster
        choices, collection assignments) before the program is set to <code>PUBLISHED</code>{' '}
        and becomes visible to the play API.
      </p>

    </>
  ),
}
