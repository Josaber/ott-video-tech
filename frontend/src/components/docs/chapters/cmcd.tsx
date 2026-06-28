import { Chapter } from '../common'
import {
  CmcdFlowFigure,
} from '../../figures'

export const chapter: Chapter = {
  slug: 'cmcd',
  title: 'CMCD / CMSD — player ↔ CDN telemetry',
  blurb: 'CTA-5004 and CTA-5006: how the player tells the CDN what it needs, and vice versa.',
  render: () => (
    <>
      <p>
        Until 2020 the CDN serving your video had almost no idea who was on the other end —
        it saw HTTP requests for segments and that was it. The player meanwhile saw HTTP
        responses with bytes and that was it. Both sides reconstructed the missing context
        from indirect signals: throughput from response timing, congestion from re-request
        patterns. Both got it wrong often. <strong>CMCD</strong> (Common Media Client Data,
        CTA-5004) and <strong>CMSD</strong> (Common Media Server Data, CTA-5006) are the
        standards that fix this by letting each side announce its state directly to the
        other.
      </p>

      <h3>The handshake</h3>
      <div className="docs-figure">
        <CmcdFlowFigure />
      </div>

      <h3>CMCD — what the player tells the CDN</h3>
      <p>
        Every segment request can carry a CMCD payload either as a URL query parameter
        (<code>?CMCD=br%3D2800%2Cbl%3D12000%2C…</code>) or as an HTTP header
        (<code>CMCD-Request: br=2800,bl=12000,…</code>). Query mode survives all CDN cache
        keys naively; header mode is preferable but needs CDN co-operation to vary on the
        header.
      </p>
      <table className="docs-gaps">
        <thead><tr><th>Key</th><th>Meaning</th><th>Why CDN cares</th></tr></thead>
        <tbody>
          <tr><td><code>br</code></td><td>requested bitrate (kbps)</td><td>predict bandwidth need</td></tr>
          <tr><td><code>bl</code></td><td>buffer length on player (ms)</td><td>which clients are starving</td></tr>
          <tr><td><code>d</code></td><td>segment duration (ms)</td><td>cache TTL hinting</td></tr>
          <tr><td><code>mtp</code></td><td>measured throughput (kbps)</td><td>CDN routing optimization</td></tr>
          <tr><td><code>ot</code></td><td>object type (v=video, a=audio, m=manifest, k=key)</td><td>per-type caching</td></tr>
          <tr><td><code>sf</code> · <code>st</code></td><td>streaming format (h=HLS, d=DASH) · stream type (v=VOD, l=live)</td><td>format-specific edge logic</td></tr>
          <tr><td><code>sid</code></td><td>session ID (per-playback UUID)</td><td>correlate one viewer's segments</td></tr>
          <tr><td><code>cid</code></td><td>content ID (asset slug)</td><td>per-asset analytics</td></tr>
          <tr><td><code>su</code></td><td>startup (boolean) — this is a startup request</td><td>prioritize first-bytes path</td></tr>
          <tr><td><code>bs</code></td><td>buffer starvation flag</td><td>treat as urgent</td></tr>
        </tbody>
      </table>

      <h3>CMSD — what the CDN tells the player</h3>
      <p>
        CMSD lands in response headers, split into static (rarely changing per session) and
        dynamic (per response). Examples:
      </p>
      <ul>
        <li>
          <code>CMSD-Static: ot=v,n="edge-LAX"</code> — object type, CDN node identifier
        </li>
        <li>
          <code>CMSD-Dynamic: etp=2500,rtt=42,dl=18,du=4000</code> — estimated throughput
          (kbps), round-trip time (ms), download time (ms), segment duration (ms)
        </li>
        <li>
          <code>su=1</code> — server is under stress; client should consider switching down
        </li>
        <li>
          <code>nor="seg-043.m4s"</code> — next-object request hint; player can prefetch
        </li>
      </ul>

      <h3>What gets unlocked</h3>
      <ul>
        <li>
          <strong>Smarter ABR.</strong> Player no longer has to <em>infer</em> throughput
          from receive timing — the CDN tells it. ABR up-shift / down-shift decisions
          converge faster and oscillate less.
        </li>
        <li>
          <strong>Per-session QoE telemetry.</strong> The <code>sid</code> field lets the
          CDN attribute every segment to a session, then export a CDN-side QoE log that
          mirrors the player-side log. Triangulating both pinpoints rebuffers far better
          than either alone.
        </li>
        <li>
          <strong>Prioritized startup.</strong> <code>su=1</code> requests get edge priority,
          cutting time-to-first-frame.
        </li>
        <li>
          <strong>Cache hit improvements.</strong> CDN hints (<code>nor</code>) let the
          player prefetch even before the playhead needs the next segment.
        </li>
      </ul>

      <h3>Adoption status (2025)</h3>
      <ul>
        <li>
          <strong>Players.</strong> hls.js, Shaka, dash.js, ExoPlayer, AVPlayer (via app-level
          wrapping) all emit CMCD natively. Most ship a sensible default subset.
        </li>
        <li>
          <strong>CDNs.</strong> Akamai, Fastly, Cloudflare, AWS CloudFront all parse CMCD
          for routing / logging. CMSD response emission is newer — Akamai and Fastly lead,
          others rolling.
        </li>
        <li>
          <strong>DRM-protected segments.</strong> CMCD fields go in URL or header — both
          survive encryption since they're metadata, not media payload.
        </li>
      </ul>

      <h3>Gotchas</h3>
      <ul>
        <li>
          <strong>Privacy.</strong> <code>sid</code> is per-session UUID, not user-identifying.
          Don't shove a user ID into <code>cid</code> — content ID is asset-level.
        </li>
        <li>
          <strong>Query mode + cache keys.</strong> If the CDN doesn't strip CMCD query
          params before computing cache key, every request becomes a unique URL and
          cache-hit rate craters. Header mode avoids this entirely.
        </li>
        <li>
          <strong>Length limits.</strong> URL query mode is bounded by total URL length;
          don't emit every field every request. Send <code>br</code>, <code>bl</code>,
          <code>mtp</code> always; send <code>sid</code>, <code>cid</code> once per session
          if header mode is unavailable.
        </li>
      </ul>
    </>
  ),
}
