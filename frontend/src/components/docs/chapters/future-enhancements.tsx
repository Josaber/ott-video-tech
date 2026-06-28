import { Chapter, L } from '../common'

export const chapter: Chapter = {
  slug: 'future-enhancements',
  title: 'Future enhancements',
  blurb: 'Concrete next features the demo deliberately did not ship — what each costs, what each unlocks.',
  render: () => (
    <>
      <p>
        This is the live punch list of "what could be added next". Each item names what
        to build, roughly how much work it costs, and what part of the OTT story it
        completes. Distinguished from <L slug="gaps">Production gaps</L> which catalogs
        what the demo intentionally OMITS conceptually — this page catalogs concrete
        features that would be reasonable to ship in subsequent passes.
      </p>

      <h3>Monetization (the biggest single gap)</h3>
      <table className="docs-gaps">
        <thead><tr><th>Feature</th><th>What it adds</th></tr></thead>
        <tbody>
          <tr>
            <td>Subscription tiers (Free / Basic / Premium)</td>
            <td>Tier on the user row gates max-ladder-tier, max concurrent streams (reuses Feature 8), multi-audio access. ~½ day.</td>
          </tr>
          <tr>
            <td>Geo-blocking</td>
            <td>IP → ISO country mapping (MaxMind GeoLite), per-asset allow / deny list, 403 on
              <code>/master.m3u8</code> with explicit reason. ~½ day.</td>
          </tr>
          <tr>
            <td>Trial period + promo codes</td>
            <td><code>trial_ends_at</code> on user, promo redemption that bumps it. Sets up the conversion funnel.</td>
          </tr>
          <tr>
            <td>Stripe checkout integration</td>
            <td>Subscribe / cancel / upgrade flows via Stripe Checkout + webhooks on
              <code>invoice.paid</code> / <code>customer.subscription.deleted</code>. ~1 day.</td>
          </tr>
          <tr>
            <td>Gifting / family accounts</td>
            <td>Parent account shares entitlement with up to N child profiles. The profiles
              pattern from <L slug="identity">Identity & profiles</L>.</td>
          </tr>
        </tbody>
      </table>

      <h3>Real DRM</h3>
      <table className="docs-gaps">
        <thead><tr><th>Feature</th><th>What it adds</th></tr></thead>
        <tbody>
          <tr>
            <td>ClearKey EME</td>
            <td>Browser-native EME flow (<code>navigator.requestMediaKeySystemAccess</code> →
              <code>MediaKeys.createSession</code> → <code>generateRequest</code> → <code>update</code>)
              with zero licence server — the JSON key dictionary IS the licence. Upgrades
              <L slug="drm">DRM-lite</L> from HMAC token to spec-compliant EME. ~½ day.</td>
          </tr>
          <tr>
            <td>Widevine L3 (real licence server)</td>
            <td>Open-source license server (e.g., shaka-streamer) returning Widevine licences
              bound to the user's device. Significant work — see <L slug="multi-drm">Multi-DRM</L>.</td>
          </tr>
          <tr>
            <td>HDCP signaling</td>
            <td><code>HDCP-LEVEL</code> on EXT-X-STREAM-INF restricts which tiers play on
              non-secure output paths (mirrored screens, captured displays).</td>
          </tr>
        </tbody>
      </table>

      <h3>Codec & packaging depth</h3>
      <table className="docs-gaps">
        <thead><tr><th>Feature</th><th>What it adds</th></tr></thead>
        <tbody>
          <tr>
            <td>HDR / Dolby Vision pipeline</td>
            <td>x265 <code>--hdr</code> + Master Display + MaxFALL/MaxCLL + manifest
              <code>VIDEO-RANGE=PQ</code>. Needs a 10-bit HDR mezzanine source. Real
              premium-tier OTT feature.</td>
          </tr>
          <tr>
            <td>AV1 / HEVC second codec family</td>
            <td>Same content packaged into x264 + SVT-AV1 ladders, master.m3u8 chooses by
              device codec support. Halves egress on AV1-capable clients.</td>
          </tr>
          <tr>
            <td>True LL-HLS (PART + blocking reload)</td>
            <td>Current live channel is fMP4 1 s segments (~3-4 s latency). True LL-HLS via
              shaka-packager (or a newer ffmpeg) adds <code>EXT-X-PART</code>,
              <code>EXT-X-PRELOAD-HINT</code>, <code>EXT-X-SERVER-CONTROL CAN-BLOCK-RELOAD=YES</code>,
              and the long-poll <code>?_HLS_msn=N&_HLS_part=M</code> playlist endpoint —
              drops latency to &lt; 2 s.</td>
          </tr>
          <tr>
            <td>EBU R128 loudness normalisation</td>
            <td>Two-pass <code>ffmpeg -af loudnorm=I=-23</code> at transcode time. Audio side
              of the pipeline currently untouched. See <L slug="audio-basics">Audio basics</L> +
              <L slug="compliance">Compliance</L>.</td>
          </tr>
          <tr>
            <td>Audio description track</td>
            <td>Separate AUDIO group with <code>CHARACTERISTICS="public.accessibility.describes-video"</code>.
              Accessibility-critical.</td>
          </tr>
          <tr>
            <td><code>EXT-X-I-FRAMES-ONLY</code> playlist</td>
            <td>Generated alongside the main ladder. Apple TV / iOS native player uses it for
              4× / 8× fast-forward — complements the WebVTT sprite trick-play in
              <L slug="trick-play">Trick-play</L>.</td>
          </tr>
        </tbody>
      </table>

      <h3>Operations &amp; observability</h3>
      <table className="docs-gaps">
        <thead><tr><th>Feature</th><th>What it adds</th></tr></thead>
        <tbody>
          <tr>
            <td>OpenTelemetry tracing</td>
            <td>Backend spans exported to Jaeger / Tempo. A single play request would render
              as a full path: manifest fetch → ad-service VAST → SSAI stitch → license sign
              → CDN edge proxy. See <L slug="observability">Observability</L>.</td>
          </tr>
          <tr>
            <td>CMCD multi-dim drill-down</td>
            <td>Current CMCD dashboard aggregates globally. Add per-asset / per-CDN /
              per-device / per-geo slicers. Histogram rebuffer / startup.</td>
          </tr>
          <tr>
            <td>A/B testing framework</td>
            <td>Same asset, two ladder configurations (or two encoder presets). User UID
              hashed to bucket A or B. Compare startup time, VMAF, rebuffer rate via the
              CMCD pipeline.</td>
          </tr>
          <tr>
            <td>Cost-per-delivery dashboard</td>
            <td>Egress GB × CDN unit price + encode hours × instance price = per-publish
              cost. The bookkeeping side of <L slug="cost">Cost</L>.</td>
          </tr>
          <tr>
            <td>Multi-CDN failover</td>
            <td>A second cdn-service on port :8096; player <code>xhrSetup</code> switches on
              consecutive 5xx. Uses CMCD <code>nor</code> field for next-object hint to warm
              the failover cache. Real OTT runs ≥ 3 CDNs.</td>
          </tr>
        </tbody>
      </table>

      <h3>Player UX rounding</h3>
      <table className="docs-gaps">
        <thead><tr><th>Feature</th><th>What it adds</th></tr></thead>
        <tbody>
          <tr>
            <td>Real Chromecast</td>
            <td>Register a receiver app with Google, load the Cast sender SDK, sync playback
              state between sender + receiver. ~1 day. PiP / AirPlay are already shipped.</td>
          </tr>
          <tr>
            <td>Keyboard shortcuts</td>
            <td>J / K / L (back / pause / forward), space, ←→ for ±10 s, <code>&lt;</code> / <code>&gt;</code>
              for ½× / 2× speed, <code>,</code> / <code>.</code> for single-frame.</td>
          </tr>
          <tr>
            <td>Auto-play next episode</td>
            <td>Playlist / season concept on the catalog side, a "Next episode in N seconds"
              countdown overlay during last 15 s of an episode. Netflix-standard.</td>
          </tr>
          <tr>
            <td>Intro / recap skip</td>
            <td>Audio fingerprint detection or hand-annotated intro / recap regions, a
              "Skip intro" button appearing during the matching segment.</td>
          </tr>
        </tbody>
      </table>

      <h3>What's NOT on this list (intentionally)</h3>
      <p>
        Anything that requires fundamentally different infrastructure than what the demo
        already runs locally — peer-assisted delivery, P2P multicast, satellite ingest,
        tape-out workflows, ATSC 3.0 / DVB head-ends. Those are real OTT topics but
        unbounded to add to a teaching demo.
      </p>
    </>
  ),
}
