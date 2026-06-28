import { Chapter, L } from '../common'

export const chapter: Chapter = {
  slug: 'guide',
  title: 'How to read this',
  blurb: 'Six reading paths for different audiences — pick the one closest to your role.',
  render: () => (
    <>
      <p>
        This doc is built around a working OTT demo, but the topics generalise. Below are
        six reading paths depending on what you do. The fastest way to find what's relevant
        is to skim each chapter's headings on your path, then read end-to-end only the ones
        that answer a question you already have.
      </p>
      <p>
        Every chapter name below is a link — click to jump.
      </p>

      <h3>Backend engineer joining an OTT team</h3>
      <ol>
        <li><L slug="overview">Overview</L> — what you're building.</li>
        <li><L slug="time-timestamps">Time, clocks & timestamps</L> + <L slug="crypto-basics">Cryptography primitives</L> — load-bearing primitives the rest of the codebase assumes.</li>
        <li><L slug="hls">HLS essentials</L> + <L slug="manifest">Manifest deep-dive</L> — the protocol the team writes against.</li>
        <li><L slug="qc-vmaf">QC & VMAF</L> — how quality is graded before bytes ship.</li>
        <li><L slug="ssai">Server-Side Ad Insertion</L> + <L slug="ad-operations">Ad operations</L> — the most code-heavy thing the platform does, and why it pays.</li>
        <li><L slug="cms-editorial">CMS workflow</L> + <L slug="recommendation">Recommendation cascade</L> — the editorial + discovery layer wrapping the playback.</li>
        <li><L slug="multi-drm">Multi-DRM in production</L> — how the entitlement layer plugs into vendor licence servers.</li>
        <li><L slug="gaps">Production gaps</L> — what's intentionally missing from the demo.</li>
      </ol>

      <h3>Frontend / web-player engineer</h3>
      <ol>
        <li><L slug="audio-basics">Audio fundamentals</L> + <L slug="video-basics">Video fundamentals</L> + <L slug="color-basics">Color, light & vision</L> — what your player is decoding.</li>
        <li><L slug="hls">HLS essentials</L> · <L slug="containers">Containers</L> · <L slug="codecs">Codecs</L> — the protocol and bitstreams.</li>
        <li><L slug="player">Player & client architecture</L> — your daily tools (hls.js / shaka / native).</li>
        <li><L slug="cmcd">CMCD / CMSD</L> — the player↔CDN telemetry handshake that modern ABR depends on.</li>
        <li><L slug="trick-play">Trick-play & thumbnails</L> — the seek-bar UX users complain about.</li>
        <li><L slug="multi-drm">Multi-DRM in production</L> — what your EME code is actually doing.</li>
        <li><L slug="observability">Observability & QoE</L> — what your telemetry instrumentation drives.</li>
      </ol>

      <h3>Mobile / CTV client engineer</h3>
      <ol>
        <li><L slug="devices">Device platforms & SDKs</L> — your platform's quirks.</li>
        <li><L slug="networking-basics">Networking primitives</L> + <L slug="cmcd">CMCD / CMSD</L> — TCP / TLS / HTTP/3 hit hardest on mobile; CMCD is how your player co-operates with the CDN.</li>
        <li><L slug="player">Player & client architecture</L> — the JS reference; substitute your native equivalent.</li>
        <li><L slug="multi-drm">Multi-DRM in production</L> — Widevine vs FairPlay vs PlayReady depending on your platform.</li>
        <li><L slug="identity">Identity, profiles & devices</L> + <L slug="concurrent-streams">Concurrent streams</L> — registration + the household-cap rules your client enforces.</li>
        <li><L slug="trick-play">Trick-play & thumbnails</L> — most-shipped feature you'll touch.</li>
      </ol>

      <h3>Security / DRM engineer</h3>
      <ol>
        <li><L slug="crypto-basics">Cryptography primitives</L> — AES modes, HMAC, nonces, signed URLs.</li>
        <li><L slug="auth">Auth & session</L> — the access-token foundation.</li>
        <li><L slug="drm">DRM-lite vs production DRM</L> + <L slug="multi-drm">Multi-DRM in production</L> — the key-fetch stack.</li>
        <li><L slug="watermarking">Forensic watermarking</L> + <L slug="anti-piracy">Anti-piracy beyond DRM</L> — what catches leaks DRM can't stop.</li>
        <li><L slug="identity">Identity, profiles & devices</L> + <L slug="concurrent-streams">Concurrent streams</L> — device + household-cap policy.</li>
        <li><L slug="privacy">Privacy & consent</L> — IFA, TCF, COPPA.</li>
      </ol>

      <h3>PM / business person wanting the lay of the land</h3>
      <ol>
        <li><L slug="overview">Overview</L> + <L slug="metadata">Video metadata</L> + <L slug="cms-editorial">CMS workflow</L> — catalog model and the editorial pipeline that fills it.</li>
        <li><L slug="catalog">Catalog & recommendations</L> + <L slug="search">Search & discovery</L> + <L slug="recommendation">Recommendation cascade</L> — discovery UX and the four-stage funnel behind it.</li>
        <li><L slug="cost">Cost model</L> + <L slug="payments">Payments & billing</L> + <L slug="ad-operations">Ad operations</L> — how revenue and unit economics work, including ad monetization.</li>
        <li><L slug="epg-fast">FAST channels & EPG</L> — the linear / ad-supported model gaining share alongside SVOD.</li>
        <li><L slug="compliance">Compliance & accessibility</L> + <L slug="privacy">Privacy & consent</L> — what the legal team will ask about.</li>
        <li><L slug="gaps">Production gaps</L> — the engineering risk list.</li>
      </ol>

      <h3>Curious about the bits — what's a sample, a pixel, a color?</h3>
      <ol>
        <li><L slug="audio-basics">Audio fundamentals</L> — pressure waves, sampling, bit depth.</li>
        <li><L slug="video-basics">Video fundamentals</L> — pixels, frame rates, chroma subsampling.</li>
        <li><L slug="color-basics">Color, light & vision</L> — gamut, gamma, HDR transfer functions.</li>
        <li><L slug="time-timestamps">Time, clocks & timestamps</L> — PTS vs DTS, wall-clock anchoring, A/V sync.</li>
        <li><L slug="codecs">Codecs</L> + <L slug="containers">Containers</L> — what gets done with all of the above.</li>
        <li><L slug="qc-vmaf">QC & VMAF</L> — and how we measure that the bits still look right after all that compression.</li>
      </ol>

      <p>
        The reference Part (<L slug="standards">Standards & organisations</L> ·{' '}
        <L slug="gaps">Production gaps</L> · <L slug="glossary">Glossary</L>) is meant for
        lookup, not sequential reading. Open them when a term sends you scrambling.
      </p>
      <p>
        Each chapter header shows an estimated read time. Total cover-to-cover is around
        four hours; the six reading paths above each fit in 40-60 minutes.
      </p>
    </>
  ),
}
