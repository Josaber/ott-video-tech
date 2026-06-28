import { Chapter } from '../common'

export const chapter: Chapter = {
  slug: 'gaps',
  title: 'Production gaps',
  blurb: 'Every part of real OTT this demo deliberately leaves out, in one place.',
  render: () => (
    <>
      <p>
        This is a teaching demo: it covers the spine of an OTT publishing platform but
        deliberately leaves out everything operational. Each row below names a thing that real
        OTT does, the chapter that explains why, and the closest pointer at how production
        handles it.
      </p>
      <h3>Content & catalog</h3>
      <table className="docs-gaps">
        <thead><tr><th>Gap</th><th>Real solution</th></tr></thead>
        <tbody>
          <tr>
            <td>No editorial hierarchy</td>
            <td><code>VideoAssetEntity</code> stores only title + description. Production has Brand → Program → Season → Episode → Asset with rights windows and external IDs (EIDR, Gracenote). See <em>Video metadata</em>.</td>
          </tr>
          <tr>
            <td>No multi-tenancy</td>
            <td>No <code>owner_id</code> on assets, no per-tenant catalog scoping. Add an owner column + an authorization rule on every list/read.</td>
          </tr>
          <tr>
            <td>No catalog UX</td>
            <td>No rails, no recommendations, no search ranking. A real home page mixes editorial + content-based + collaborative filtering. See <em>Catalog & recommendations</em>.</td>
          </tr>
          <tr>
            <td>No mezzanine pipeline / QC</td>
            <td>Accepts whatever the browser uploads. Real ingest demands a spec'd mezzanine (ProRes / IMF) and auto-QC (Aurora / Vidchecker / Baton). See <em>Mezzanine & mastering</em>.</td>
          </tr>
        </tbody>
      </table>
      <h3>Encoding & packaging</h3>
      <table className="docs-gaps">
        <thead><tr><th>Gap</th><th>Real solution</th></tr></thead>
        <tbody>
          <tr>
            <td>Single rendition</td>
            <td>One H.264 output. Production ladders 360p → 4K HDR with keyframe alignment across renditions. See <em>Transcoding & packaging</em>.</td>
          </tr>
          <tr>
            <td>No HEVC / AV1</td>
            <td>libx264 only. Production ships dual H.264 (compatibility) + HEVC or AV1 (efficiency). See <em>Codecs</em>.</td>
          </tr>
          <tr>
            <td>.ts segments only</td>
            <td>MPEG-TS works everywhere but CMAF .m4s lets one segment set serve both HLS and DASH. See <em>Containers</em>.</td>
          </tr>
          <tr>
            <td>No captions / multi-audio</td>
            <td>No <code>EXT-X-MEDIA TYPE=SUBTITLES</code> or <code>TYPE=AUDIO</code> groups, no WebVTT / TTML sidecars, no dub tracks. See <em>Captions & subtitles workflow</em>.</td>
          </tr>
          <tr>
            <td>No loudness / color compliance</td>
            <td>No EBU R128 / ATSC A/85 loudness pass, no BT.709 vs BT.2020 handling, no PQ / HLG. See <em>Mezzanine & mastering</em>.</td>
          </tr>
        </tbody>
      </table>
      <h3>Delivery & playback</h3>
      <table className="docs-gaps">
        <thead><tr><th>Gap</th><th>Real solution</th></tr></thead>
        <tbody>
          <tr>
            <td>No CDN</td>
            <td>Backend serves bytes directly. Real OTT hides origin behind CloudFront / Fastly / Akamai with origin shield, edge cache, signed URLs. See <em>CDN & delivery network</em>.</td>
          </tr>
          <tr>
            <td>No multi-CDN</td>
            <td>Single origin = single point of failure. Real OTT routes per-session via Conviva or NPAW.</td>
          </tr>
          <tr>
            <td>No live streaming</td>
            <td>VOD only. Live needs ingest (RTMP / SRT / WHIP), sliding-window manifests, LL-HLS, SCTE-35-aware ad insertion. See <em>Live streaming pipeline</em>.</td>
          </tr>
          <tr>
            <td>No QoE telemetry</td>
            <td>Zero client telemetry, no CMCD headers, no dashboards. Real OTT runs Conviva / Mux / Bitmovin Analytics. See <em>Observability & QoE</em>.</td>
          </tr>
          <tr>
            <td>No trick-play / scrubbing preview</td>
            <td>No I-frame playlist, no thumbnail sprite. The progress bar is the HTML5 default. See <em>Trick-play & thumbnails</em>.</td>
          </tr>
        </tbody>
      </table>
      <h3>Security & rights</h3>
      <table className="docs-gaps">
        <thead><tr><th>Gap</th><th>Real solution</th></tr></thead>
        <tbody>
          <tr>
            <td>DRM-lite, not real DRM</td>
            <td>AES-128 + HMAC-signed URL. Real OTT uses Widevine / FairPlay / PlayReady via EME + a CDM, wired through a DRMaaS vendor. See <em>DRM</em> and <em>Multi-DRM in production</em>.</td>
          </tr>
          <tr>
            <td>No HDCP enforcement</td>
            <td>Key endpoint returns the AES-128 key to anyone with a valid signature; no output-protection query. Real DRMs require HDCP 2.2 for 4K HDR. See <em>Anti-piracy beyond DRM</em>.</td>
          </tr>
          <tr>
            <td>No forensic watermark</td>
            <td>Leaked captures can't be traced. Production bakes per-viewer A/B variants or stitches server-side.</td>
          </tr>
          <tr>
            <td>No geofencing / ratings</td>
            <td>Key endpoint doesn't consult per-asset country allowlists or content ratings before issuing.</td>
          </tr>
          <tr>
            <td>No concurrent-stream enforcement</td>
            <td>License endpoint doesn't track per-account active streams. Account sharing is unconstrained.</td>
          </tr>
          <tr>
            <td>No rate limiting</td>
            <td><code>/auth/login</code> and <code>/auth/register</code> accept unlimited attempts. Add bucket4j + IP + username pacing.</td>
          </tr>
          <tr>
            <td>Weak password policy</td>
            <td>Min length only. Production wants entropy checks + breach-database lookups (HIBP API).</td>
          </tr>
        </tbody>
      </table>
      <h3>Operations</h3>
      <table className="docs-gaps">
        <thead><tr><th>Gap</th><th>Real solution</th></tr></thead>
        <tbody>
          <tr>
            <td>Synchronous ad cold-start</td>
            <td>Ad-service uses on-demand FFmpeg; first <code>/vast</code> takes ~48 s. Warm the catalog at boot or pre-bake renditions.</td>
          </tr>
          <tr>
            <td>No accessibility scaffolding</td>
            <td>No captions, no audio description, no profile-level parental controls, no consent UI. CVAA, EAA, WCAG 2.2 all demand these. See <em>Compliance & accessibility</em>.</td>
          </tr>
          <tr>
            <td>No data-protection plumbing</td>
            <td>Viewing data is personal data under GDPR / CCPA but there's no consent UI, no export, no delete.</td>
          </tr>
        </tbody>
      </table>

      <h3>Demo UX</h3>
      <table className="docs-gaps">
        <thead><tr><th>Gap</th><th>Real solution</th></tr></thead>
        <tbody>
          <tr>
            <td>Hardcoded ad ID</td>
            <td>Every asset gets <code>preroll-brand-a</code>. Production picks dynamically from an ad pod by VAST, factoring frequency caps and audience segment.</td>
          </tr>
          <tr>
            <td>No download / offline support</td>
            <td>The player has no "download for offline" action. Production needs persistent license issuance, encrypted local storage, an expiry-tracking job.</td>
          </tr>
          <tr>
            <td>No metadata editing after create</td>
            <td>Title / description are immutable post-creation. Add an admin edit form; or wire CRUD against the editorial layer.</td>
          </tr>
          <tr>
            <td>Workflow progress is stage-only</td>
            <td>The job timeline shows stage transitions but no within-stage percentage. Add FFmpeg progress parsing to surface "Transcoding 60%".</td>
          </tr>
          <tr>
            <td>No in-UI retry for FAILED workflows</td>
            <td>Admin has to re-upload to retry. Add a "Retry workflow" button that bumps the asset back to UNPUBLISHED and re-triggers the Temporal workflow without losing the raw upload.</td>
          </tr>
          <tr>
            <td>Stuck-asset sweep cadence opaque</td>
            <td>StuckAssetSweeper runs every 5 min but there's no admin "Sweep now" trigger or visibility into when it last ran.</td>
          </tr>
        </tbody>
      </table>
    </>
  ),
}
