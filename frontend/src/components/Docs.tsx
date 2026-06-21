import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ArchitectureDiagram } from './ArchitectureDiagram'
import { Glossary } from './Glossary'
import {
  HLSManifestFigure,
  CDNCacheFigure,
  LiveLatencyFigure,
  EMELicenseSequenceFigure,
  GOPFramesFigure,
  ABRLadderFigure,
  SSAISequenceFigure,
  PlayerStackFigure,
  EditorialHierarchyFigure,
  AccountProfilesDevicesFigure,
  SearchPipelineFigure,
  SubscriptionStateMachineFigure,
  ConsentFlowFigure,
  DevicePlatformsFigure,
  ContainerStructureFigure,
  CodecEfficiencyFigure,
  MasteringPipelineFigure,
  HomeRailsFigure,
  AuthRefreshFlowFigure,
  DRMLiteFlowFigure,
  TrickPlayFigure,
  ForensicWatermarkFigure,
  AudioSamplingFigure,
  ChromaSubsamplingFigure,
  GamutFigure,
  PtsDtsFigure,
  HmacFlowFigure,
  HttpVersionsFigure,
  VmafLadderFigure,
  CmcdFlowFigure,
  RecommendationCascadeFigure,
  WatermarkingFigure,
  AdAuctionFigure,
  CmsWorkflowFigure,
  ConcurrentStreamGuardFigure,
  FastEpgFigure,
} from './figures'

interface Chapter {
  slug: string
  title: string
  blurb: string
  render: () => JSX.Element
}

// Inline chapter link — clicking changes the hash, the Docs component's
// existing hashchange listener swaps the active slug. Lets the Reading
// guide chapter point at other chapters without threading setActiveSlug
// through every render() function.
function L({ slug, children }: { slug: string; children: React.ReactNode }) {
  return (
    <a className="docs-chap-link" href={`#/docs/${slug}`}>
      {children}
    </a>
  )
}

const CHAPTERS: Chapter[] = [
  {
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
  },
  {
    slug: 'overview',
    title: 'Overview',
    blurb: 'What this demo is and how the pieces fit together.',
    render: () => (
      <>
        <p>
          <strong>OTT</strong> (Over-The-Top) is video delivered over the public internet, bypassing
          traditional cable and satellite. This project is a deliberately small end-to-end VOD slice:
          a single React SPA, a Spring Boot backend that orchestrates publishing with Temporal, a
          separate Spring Boot ad-service that generates a real pre-roll on demand, and PostgreSQL
          for metadata.
        </p>
        <p>
          Publishing a video runs through six stages — <em>UPLOAD → TRANSCODE → PACKAGE → SSAI → DRM
          → PUBLISH</em> — each tracked as a row in <code>processing_jobs</code> and orchestrated by
          a Temporal workflow keyed off the asset's UUID. The diagram below shows the runtime shape
          (boxes match the JobStage enum, the amber dashed box is the cross-process Ad-Service):
        </p>
        <div className="docs-figure">
          <ArchitectureDiagram />
        </div>
        <h3>Default ports</h3>
        <ul>
          <li><code>5173</code> — Vite dev server (this SPA)</li>
          <li><code>8080</code> — Spring Boot backend (API + playback + workflow)</li>
          <li><code>8090</code> — Ad-Service (VAST + ad ts segments)</li>
          <li><code>5432</code> — PostgreSQL (Flyway-managed schema)</li>
        </ul>
      </>
    ),
  },
  {
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
  },
  {
    slug: 'mezzanine',
    title: 'Mezzanine & mastering',
    blurb: "The high-quality intermediate file every delivery encode comes from.",
    render: () => (
      <>
        <p>
          Before transcoding produces ABR renditions you need a <strong>mezzanine</strong> — the
          high-quality intermediate that's the source of truth for every delivery encode. The
          demo accepts whatever comes out of a phone; a production catalog accepts only a tightly
          spec'd mezzanine and refuses anything else.
        </p>
        <h3>Common mezzanine formats</h3>
        <table className="docs-gaps">
          <thead><tr><th>Format</th><th>Where it's used</th></tr></thead>
          <tbody>
            <tr><td>ProRes 422 HQ / 4444</td><td>Apple intermediate codec. Studio + post-production standard. ~220 Mb/s HD, ~880 Mb/s 4K. Bit-rate is "high enough not to matter" — easy to grade.</td></tr>
            <tr><td>DNxHR / DNxHD</td><td>Avid's intermediate, same role. Common in broadcast workflows.</td></tr>
            <tr><td>JPEG 2000 in MXF</td><td>SMPTE-standard. DCDM (Digital Cinema Distribution Master) and some studio OTT delivery formats. Visually lossless but slow to decode.</td></tr>
            <tr><td>IMF (SMPTE 2067)</td><td>Interoperable Master Format — component-based packaging. Video, audio tracks, subtitles, supplemental material bundled with sidecar XML (CPL, PKL, AssetMap). Studio delivery standard since ~2015.</td></tr>
            <tr><td>H.264 / HEVC mezzanine</td><td>Lossier compromise. Used by smaller ingest paths or when the original master is already H.264 and re-encoding would hurt further.</td></tr>
          </tbody>
        </table>
        <h3>Mastering pipeline</h3>
        <p>
          Capture (camera) → edit (NLE: Avid, Premiere, Resolve) → color grade (Resolve,
          Baselight) → audio mix → render (proxy → conform → output) → mezzanine → ingest. Each
          step is usually a separate team and facility for tentpole content.
        </p>
        <div className="docs-figure">
          <MasteringPipelineFigure />
        </div>
        <h3>Quality control</h3>
        <p>
          Automated QC tools enforce spec compliance before ingest: <strong>Tektronix Aurora
          </strong>, <strong>Vidchecker</strong>, <strong>Interra Baton</strong>. Common checks:
          pixel artifacts, audio loudness, black / silent frame detection, captioning sync,
          color gamut excursions, file integrity.
        </p>
        <h3>Loudness</h3>
        <p>
          Audio is measured in <strong>LUFS</strong> (or LKFS for ATSC) — integrated loudness
          across the whole program. Common targets:
        </p>
        <ul>
          <li><strong>-23 LUFS</strong> — EBU R128 (European broadcast)</li>
          <li><strong>-24 LKFS</strong> — ATSC A/85 (US broadcast, the "CALM Act" target)</li>
          <li><strong>-16 LUFS</strong> — typical streaming (Spotify, Apple Music)</li>
          <li><strong>-14 LUFS</strong> — louder streaming target (YouTube)</li>
        </ul>
        <p>
          Ads must match the program's loudness target — otherwise the volume jump triggers
          viewer complaints, and in the US regulator fines.
        </p>
        <h3>Color & HDR</h3>
        <p>
          SDR sticks to <strong>BT.709</strong> color primaries with a power-2.2 / 2.4 gamma
          curve. HDR moves to <strong>BT.2020</strong> (wider gamut) with one of two transfer
          functions: <strong>PQ</strong> (Perceptual Quantizer — Dolby Vision / HDR10, absolute
          brightness reference) or <strong>HLG</strong> (Hybrid Log-Gamma — BBC, NHK,
          backwards-compatible with SDR displays).
        </p>
      </>
    ),
  },
  {
    slug: 'audio-basics',
    title: 'Audio fundamentals',
    blurb: 'Pressure waves, sampling, bit depth, channels — the layer below the audio codec chapter.',
    render: () => (
      <>
        <p>
          Codec chapters mention AAC at 128 kbps stereo without spelling out what's being
          compressed. This chapter is the layer below: how a sound becomes a stream of numbers,
          and what the codec then squeezes.
        </p>

        <h3>From pressure wave to samples</h3>
        <p>
          Sound is a pressure wave — alternating compression and rarefaction in air. A
          microphone turns it into a voltage that varies continuously in time. To put it in a
          file, the recorder takes <strong>samples</strong> at regular intervals and stores
          each as a number.
        </p>
        <div className="docs-figure">
          <AudioSamplingFigure />
        </div>
        <p>
          The number of samples per second is the <strong>sample rate</strong>. The Nyquist
          theorem says you can reconstruct any frequency up to half the sample rate. Audible
          sound tops out around 20 kHz, so the sample rate has to be at least ~40 kHz.
        </p>
        <table className="docs-gaps">
          <thead><tr><th>Sample rate</th><th>Use</th></tr></thead>
          <tbody>
            <tr><td>44.1 kHz</td><td>CD-quality. Nyquist + a small filter margin. Default for most music delivery.</td></tr>
            <tr><td>48 kHz</td><td>Video / broadcast default. Aligns with 24 / 25 / 30 fps frame rates.</td></tr>
            <tr><td>96 / 192 kHz</td><td>Mastering and high-res audio. Headroom for post-production filters; no perceptible playback benefit for most listeners.</td></tr>
          </tbody>
        </table>

        <h3>Bit depth</h3>
        <p>
          Each sample is quantised to an integer. <strong>Bit depth</strong> sets how many
          levels:
        </p>
        <ul>
          <li><strong>16-bit</strong> — 65,536 levels. CD-quality. 96 dB dynamic range. Streaming default.</li>
          <li><strong>24-bit</strong> — 16 M levels. 144 dB. Mastering and broadcast.</li>
          <li><strong>32-bit float</strong> — effectively unlimited headroom. Used inside DAWs to avoid clipping during processing.</li>
        </ul>

        <h3>Channels</h3>
        <p>
          Each channel is its own stream of samples — left, right, surround, height. See the
          Channel layout entry in the Glossary for Mono / Stereo / 5.1 / 7.1 / Atmos.
        </p>

        <h3>PCM vs perceptual compression</h3>
        <p>
          Raw samples (<strong>PCM</strong>) are huge — 1.4 Mb/s for CD stereo, 6 Mb/s for
          24-bit 96 kHz 5.1. Streaming uses <strong>perceptual codecs</strong> (AAC, Opus,
          AC-3, E-AC-3) that exploit how the ear works:
        </p>
        <ul>
          <li><strong>Frequency masking</strong> — a loud tone at one frequency makes nearby quieter tones inaudible. Drop those bits.</li>
          <li><strong>Threshold of hearing</strong> — the ear is most sensitive around 2-5 kHz, drops off at the edges. Quantise less precisely outside the sensitive band.</li>
          <li><strong>Temporal masking</strong> — a loud event masks quiet events just before and after it.</li>
        </ul>
        <p>
          128 kbps AAC is ~10× smaller than CD-quality PCM but indistinguishable to most
          listeners on most material.
        </p>

        <h3>Loudness</h3>
        <p>
          Sample peaks ≠ perceived loudness. The ear integrates over time and across the
          spectrum. <strong>LUFS</strong> (Loudness Units relative to Full Scale, ITU 1770)
          is the streaming-standard measurement. See <em>Mezzanine & mastering</em> for the
          normalisation targets per market.
        </p>
      </>
    ),
  },
  {
    slug: 'video-basics',
    title: 'Video fundamentals',
    blurb: 'Pixels, frame rate, scan modes, chroma subsampling — what video codecs operate on.',
    render: () => (
      <>
        <p>
          Codec chapters talk about encoding "1080p at 5 Mbps" without spelling out what the
          bitstream represents. This chapter is the layer below: how a moving image becomes a
          grid of numbers per frame.
        </p>

        <h3>Image = pixel grid</h3>
        <p>
          Every frame is a 2D grid of <strong>pixels</strong> ("picture elements"), each
          carrying a color. The grid size is the <strong>resolution</strong>.
        </p>
        <table className="docs-gaps">
          <thead><tr><th>Common resolution</th><th>Pixels</th></tr></thead>
          <tbody>
            <tr><td>480p (SD)</td><td>854 × 480 ≈ 0.4 MP</td></tr>
            <tr><td>720p (HD)</td><td>1280 × 720 ≈ 0.9 MP</td></tr>
            <tr><td>1080p (Full HD)</td><td>1920 × 1080 ≈ 2.1 MP</td></tr>
            <tr><td>4K UHD</td><td>3840 × 2160 ≈ 8.3 MP</td></tr>
            <tr><td>8K</td><td>7680 × 4320 ≈ 33.2 MP</td></tr>
          </tbody>
        </table>

        <h3>Aspect ratio</h3>
        <p>
          Width-to-height ratio of the frame. Common shapes:
        </p>
        <ul>
          <li><strong>16:9</strong> — modern TV + nearly all OTT.</li>
          <li><strong>21:9</strong> — ultrawide cinema / IMAX. Letterboxed on 16:9 displays.</li>
          <li><strong>4:3</strong> — pre-2003 TV. Mostly archival now.</li>
          <li><strong>9:16</strong> — vertical (TikTok / Stories / Shorts). Mobile-first content.</li>
          <li><strong>1:1</strong> — square. Social previews.</li>
        </ul>

        <h3>Frame rate</h3>
        <p>
          Frames per second. The eye fuses ~24+ fps into smooth motion; higher rates feel
          more "real".
        </p>
        <table className="docs-gaps">
          <thead><tr><th>fps</th><th>Used for</th></tr></thead>
          <tbody>
            <tr><td>24</td><td>Cinema. The "film look".</td></tr>
            <tr><td>25 / 50</td><td>PAL broadcast (Europe).</td></tr>
            <tr><td>29.97 / 59.94</td><td>NTSC broadcast (US). The fractional rate is a 1953 hack to fit color into the same spectrum as B&W.</td></tr>
            <tr><td>30 / 60</td><td>Web video, mobile recording defaults.</td></tr>
            <tr><td>120 / 240</td><td>Sports broadcast, high-end gaming, slow-motion source.</td></tr>
          </tbody>
        </table>

        <h3>Progressive vs interlaced</h3>
        <p>
          Old broadcast (1080i) sent every other line per field — odd lines first, even lines
          next, two fields per frame. Modern delivery is universally <strong>progressive</strong>:
          every line of every frame, in order. Interlaced source is de-interlaced before encode.
        </p>

        <h3>RGB vs YUV (luma + chroma)</h3>
        <p>
          Display hardware uses red / green / blue per pixel. Codecs work in <strong>YUV</strong>
          {' '}instead:
        </p>
        <ul>
          <li><strong>Y</strong> (luma) — brightness, the part the eye is most sensitive to.</li>
          <li><strong>U</strong> and <strong>V</strong> (chroma) — color information.</li>
        </ul>
        <p>
          Separating brightness from color lets the codec exploit a key fact: the eye is much
          less sensitive to fine color detail than to fine brightness detail.
        </p>

        <h3>Chroma subsampling</h3>
        <p>
          Codecs store luma at full resolution but downsample chroma. Three standard ratios:
        </p>
        <div className="docs-figure">
          <ChromaSubsamplingFigure />
        </div>
        <ul>
          <li><strong>4:4:4</strong> — full chroma. Mastering and graphics.</li>
          <li><strong>4:2:2</strong> — chroma at half horizontal resolution. Broadcast / professional.</li>
          <li><strong>4:2:0</strong> — chroma at half horizontal AND vertical. Streaming default. ½ the chroma data, ~no perceptual loss on most content.</li>
        </ul>

        <h3>Bit depth per channel</h3>
        <p>
          8-bit (256 levels per channel) is the SDR streaming default. HDR pipelines need{' '}
          <strong>10-bit</strong> (1024 levels) to avoid banding in dark gradients. 12-bit
          appears in some mastering and Dolby Vision flows.
        </p>
      </>
    ),
  },
  {
    slug: 'color-basics',
    title: 'Color, light & vision',
    blurb: 'Color spaces, gamut, gamma, HDR transfer functions — what video pixels actually carry.',
    render: () => (
      <>
        <p>
          Other chapters mention BT.709, BT.2020, PQ, HLG without pinning down what they mean.
          This chapter is the perception side: how human vision works, and how digital video
          encodes the result.
        </p>

        <h3>Light and the human eye</h3>
        <p>
          Visible light is electromagnetic radiation from ~380 nm (deep violet) to ~700 nm
          (deep red). The retina has two receptor types:
        </p>
        <ul>
          <li><strong>Rods</strong> — sensitive to brightness, no color, used in dim light.</li>
          <li><strong>Cones</strong> — three types, sensitive to roughly red / green / blue light. Vision is more sensitive to green (peak ~555 nm).</li>
        </ul>
        <p>
          Most video pipelines model color as combinations of red / green / blue stimuli
          matching cone responses. CIE in 1931 codified this as <strong>CIE XYZ</strong>, the
          absolute reference every other color space sits on top of.
        </p>

        <h3>Color space and gamut</h3>
        <p>
          A <strong>color space</strong> picks three primary colors (R, G, B) and a white
          point, then defines all reproducible colors as combinations of those primaries. The
          set of reachable colors is the <strong>gamut</strong>.
        </p>
        <div className="docs-figure">
          <GamutFigure />
        </div>
        <table className="docs-gaps">
          <thead><tr><th>Space</th><th>Where</th></tr></thead>
          <tbody>
            <tr><td><strong>sRGB</strong></td><td>1996. Web standard. Matches what consumer monitors of the late '90s could display.</td></tr>
            <tr><td><strong>BT.709</strong></td><td>HD SDR — TV, Blu-ray, modern streaming. Almost identical primaries to sRGB but a different transfer function.</td></tr>
            <tr><td><strong>DCI-P3</strong></td><td>Cinema and modern mobile / desktop displays (Apple Display P3). ~25% wider gamut than BT.709.</td></tr>
            <tr><td><strong>BT.2020</strong></td><td>UHD / HDR — 4K HDR streaming, Dolby Vision, HDR10. ~75% of visible colors. No current consumer display covers it fully.</td></tr>
            <tr><td><strong>ACES</strong></td><td>Academy Color Encoding System. Production mastering. Covers all visible colors with headroom.</td></tr>
          </tbody>
        </table>

        <h3>Gamma / transfer function</h3>
        <p>
          Doubling a pixel's stored value does NOT double the displayed brightness. The eye
          responds non-linearly to luminance — it's much more sensitive to small differences
          in dark areas than in bright ones. The <strong>transfer function</strong> (often
          called <strong>gamma</strong>) encodes light into pixel values along a curve that
          puts more codes where the eye can see them.
        </p>
        <p>
          SDR uses a power-curve gamma (~2.2 in sRGB, ~2.4 in BT.709). HDR introduces two new
          transfer functions:
        </p>
        <ul>
          <li><strong>PQ</strong> (Perceptual Quantizer, SMPTE ST 2084) — absolute brightness reference, peak 10,000 nits. Each code value maps to a specific cd/m². Used by HDR10 and Dolby Vision.</li>
          <li><strong>HLG</strong> (Hybrid Log-Gamma, BBC + NHK) — relative brightness, backwards-compatible with SDR displays. Used by live broadcast HDR.</li>
        </ul>

        <h3>White point</h3>
        <p>
          The "neutral" white of a color space. Most modern video uses <strong>D65</strong>{' '}
          (6504 K — overcast daylight). Cinema uses <strong>D55</strong> or the slightly
          warmer <strong>DCI</strong> white. A mismatch makes whites look tinted blue or
          yellow.
        </p>

        <h3>Bit depth and banding</h3>
        <p>
          8 bits per channel = 256 levels. In a smooth dark-to-light sky, the steps between
          levels become visible as <strong>banding</strong>. HDR extends brightness range
          ~100×, which would make 8-bit banding much worse, so HDR mandates 10-bit (1024
          levels) at minimum.
        </p>

        <h3>What it means for the codec</h3>
        <p>
          A codec stream is a triple: <em>gamut + transfer function + bit depth</em>. An
          HDR10 stream is "BT.2020 primaries + PQ transfer + 10-bit per channel". The decoder
          needs to know all three to map pixel values back to the correct light. The HEVC
          bitstream carries them in metadata (color primaries / transfer characteristics /
          matrix coefficients fields).
        </p>
      </>
    ),
  },
  {
    slug: 'time-timestamps',
    title: 'Time, clocks & timestamps',
    blurb: 'PTS, DTS, media time vs wall clock, A/V sync, the live edge.',
    render: () => (
      <>
        <p>
          Almost every later chapter — SSAI, Live, Trick-play, Manifest deep-dive — assumes
          a time model the reader already understands. This chapter is that model: how
          decoders track media time, how that maps to the viewer's wall clock, and why A/V
          sync is a real engineering problem.
        </p>

        <h3>The 90 kHz clock</h3>
        <p>
          MPEG decided in 1993 that media time would tick at <strong>90,000 Hz</strong>. Every
          sample, every frame, every audio packet carries a timestamp in these units. 90 kHz
          is divisible by every common video frame rate (24, 25, 30, 60) and audio sample rate
          (8, 16, 32, 48 kHz). One tick ≈ 11.1 µs.
        </p>
        <p>
          ISO BMFF / CMAF use a flexible per-track <code>timescale</code> instead of a fixed
          90 kHz. The principle is the same: every timestamp is in ticks of the track's clock.
        </p>

        <h3>PTS vs DTS — decode order ≠ display order</h3>
        <p>
          B-frames (covered in <em>Codecs</em>) are predicted from BOTH past and future I/P
          frames. So the decoder needs the future frame BEFORE it can render the B-frame in
          between. Decode and display orders are different:
        </p>
        <div className="docs-figure">
          <PtsDtsFigure />
        </div>
        <ul>
          <li><strong>DTS</strong> (Decoding Timestamp) — when this frame should be handed to the decoder.</li>
          <li><strong>PTS</strong> (Presentation Timestamp) — when the decoded frame should be displayed.</li>
        </ul>
        <p>
          For an I- or P-frame, DTS = PTS. For a B-frame, PTS &gt; DTS — the decoder
          receives the frame earlier than it's shown. Container formats (MP4, MPEG-TS, CMAF)
          carry both timestamps per sample.
        </p>

        <h3>Media time vs wall-clock time</h3>
        <p>
          <strong>Media time</strong> starts at 0 at the beginning of the program. The seek
          bar reads media time. VOD only ever needs this.
        </p>
        <p>
          <strong>Wall-clock time</strong> is the real-world time. Live streaming needs it to
          answer "how stale am I vs the live edge?" and "what time is it on the air?"
        </p>
        <p>
          HLS anchors the two with <code>#EXT-X-PROGRAM-DATE-TIME</code> on a live media
          playlist:
        </p>
        <pre><code>{`#EXT-X-PROGRAM-DATE-TIME:2026-06-19T14:30:00Z
#EXTINF:4.000,
segment_8123.ts`}</code></pre>
        <p>
          Every later segment's wall-clock time = anchor + cumulative media duration. DASH
          uses <code>availabilityStartTime</code> on the MPD root and{' '}
          <code>presentationTimeOffset</code> per period for the same purpose.
        </p>

        <h3>PCR — TS-level synchronisation</h3>
        <p>
          MPEG Transport Stream (.ts) carries a <strong>Program Clock Reference</strong> at
          the packet level, embedded periodically in the elementary stream. The decoder uses
          PCR to re-derive its local 90 kHz clock from the wire — it's how the receiver stays
          synchronised with the encoder despite network jitter. CMAF doesn't have PCR; the
          player relies on segment boundaries + the manifest timeline.
        </p>

        <h3>A/V sync</h3>
        <p>
          Video and audio are decoded by independent paths inside the player. Each has its
          own clock derived from PTS. Modern decoders run a slave-master sync loop: audio is
          usually the master (a glitch is more annoying than a hiccup), video adjusts to
          match by dropping or repeating frames.
        </p>
        <p>
          Tolerance: lipsync that lags by more than ~45 ms is detectable; more than ~125 ms
          is actively distracting. ATSC A/85 and ITU-R BT.1359 specify these thresholds.
        </p>

        <h3>The live edge</h3>
        <p>
          The <strong>live edge</strong> is the most recent segment available. The player's
          distance from the edge is the latency budget covered in <em>Live streaming pipeline</em>.
          A player at the edge sees the encoder's most-recent output; a player in DVR mode
          sees an older segment from the retention window.
        </p>

        <h3>Time-shift and DVR window</h3>
        <p>
          Live HLS keeps the last N segments in the manifest (sliding window). The retention
          tail is the <strong>DVR window</strong> — pause, scrub-back and restart-from-the-top
          all key off how far back PROGRAM-DATE-TIME reaches. Real OTT live keeps anywhere
          from 30 min (sports) to 7 days (catch-up TV) of DVR.
        </p>

        <h3>Edge cases</h3>
        <ul>
          <li><strong>Clock drift across encoders.</strong> Multi-camera live ingests must NTP-sync within ms; otherwise inter-cam switching glitches.</li>
          <li><strong>Daylight saving.</strong> PROGRAM-DATE-TIME is always UTC. Frontend converts to viewer-local for display.</li>
          <li><strong>Leap seconds.</strong> Most pipelines use UTC-SLS or smear the leap second to avoid 23:59:60. ESPN famously dropped a frame in 2008.</li>
        </ul>
      </>
    ),
  },
  {
    slug: 'crypto-basics',
    title: 'Cryptography primitives',
    blurb: 'AES, HMAC, nonces, signed URLs — what the DRM and auth chapters quietly assume.',
    render: () => (
      <>
        <p>
          DRM-lite uses AES-128 to encrypt segments and HMAC to sign license URLs. Auth uses
          HMAC-SHA256 to sign JWTs. The chapters describe the wiring but assume the reader
          knows what these primitives are. This chapter is the assumed background.
        </p>

        <h3>Symmetric vs asymmetric</h3>
        <p>
          <strong>Symmetric</strong> cryptography uses one secret key shared by both sides
          — fast, but the key has to be distributed securely. AES, HMAC, and DRM content
          keys are all symmetric.
        </p>
        <p>
          <strong>Asymmetric</strong> uses a key pair (public + private). Slower, but the
          public half can be published. TLS handshake + JWT signatures (RS256, ES256) use
          asymmetric. JWT HS256 (this demo) uses symmetric.
        </p>

        <h3>AES — Advanced Encryption Standard</h3>
        <p>
          Block cipher. Takes a 128-bit block of plaintext + a key (128, 192, or 256 bits),
          produces a 128-bit block of ciphertext. Universal hardware support since ~2010 via
          AES-NI on Intel / ARMv8 crypto extensions.
        </p>
        <p>
          AES alone only handles one block at a time; to encrypt a long stream you wrap it
          in a <strong>mode of operation</strong>:
        </p>
        <ul>
          <li><strong>CBC</strong> (Cipher Block Chaining) — each block XORs with the previous ciphertext before encrypt. Needs an IV. Order-dependent. HLS classic <code>#EXT-X-KEY METHOD=AES-128</code> uses CBC.</li>
          <li><strong>CTR</strong> (Counter mode) — XOR plaintext with AES(counter). Counter increments per block. Parallelisable. Used by CENC <code>cenc</code> scheme.</li>
          <li><strong>GCM</strong> (Galois/Counter Mode) — CTR + authentication tag in one pass. Most modern. TLS 1.3 uses it.</li>
          <li><strong>CBCS</strong> — CBC with chunked encryption. Used by CENC <code>cbcs</code> scheme (FairPlay-compatible).</li>
        </ul>

        <h3>HMAC — keyed hash for authentication</h3>
        <p>
          <strong>HMAC</strong> (Hash-based Message Authentication Code) takes a key and a
          message, produces a fixed-size tag (32 bytes for HMAC-SHA256). Anyone with the key
          can verify; anyone without the key can't forge a valid tag for a chosen message.
        </p>
        <div className="docs-figure">
          <HmacFlowFigure />
        </div>
        <pre><code>{`tag = HMAC(key, "user=alice&exp=1781796000&nonce=abc123")
url = "license.key?user=alice&exp=1781796000&nonce=abc123&sig=" + base64url(tag)`}</code></pre>
        <p>
          The receiver recomputes the HMAC from the URL's query params and compares to the
          provided sig. Match → trusted; mismatch → 403. The key never leaves the server.
          Comparison must use <strong>constant-time</strong> equality (e.g., <code>MessageDigest.isEqual</code>)
          to defeat timing side channels.
        </p>

        <h3>Nonce, IV, salt — non-secret random values</h3>
        <ul>
          <li><strong>Nonce</strong> ("number used once") — single-use random value bound to an operation. Prevents replay attacks. License URLs add a nonce so the same signed URL can't be replayed twice.</li>
          <li><strong>IV</strong> (Initialisation Vector) — random per-message starting state for a cipher in a chaining mode. AES-CBC requires a different IV per message under the same key.</li>
          <li><strong>Salt</strong> — random value appended to a password before hashing. Defeats rainbow tables. BCrypt + Argon2 generate salt automatically.</li>
        </ul>

        <h3>Hash functions</h3>
        <ul>
          <li><strong>SHA-256</strong> — 32-byte output. Modern default. Used in HMAC-SHA256, JWT HS256.</li>
          <li><strong>SHA-1</strong> — 20-byte output. Broken since 2017. Don't use for security.</li>
          <li><strong>MD5</strong> — 16-byte output. Completely broken since ~2008. Sometimes used as a non-security checksum.</li>
          <li><strong>BLAKE3</strong> — modern, ~5× SHA-256 throughput. Not yet widespread in OTT but rising.</li>
        </ul>

        <h3>Key derivation</h3>
        <p>
          A password is not a key — keys need to be uniform random bits.{' '}
          <strong>KDF</strong> functions (PBKDF2, scrypt, Argon2) stretch a password into a
          key with a salt and an iteration count tuned to be slow. BCrypt is a password-
          hashing function with this property built in.
        </p>

        <h3>Signed URLs — the pattern</h3>
        <p>
          Used everywhere in OTT — CDN URLs, DRM license URLs, share links. The pattern:
        </p>
        <ol>
          <li>Server constructs a canonical message from the URL's query params: <code>"path=/x&exp=N&user=Y"</code>.</li>
          <li>Server computes <code>sig = HMAC(secret_key, canonical_message)</code>.</li>
          <li>Server appends <code>&sig=base64url(sig)</code> to the URL and hands it to the client.</li>
          <li>The receiving server recomputes the HMAC from the query params and compares with constant-time equality.</li>
        </ol>
        <p>
          Same shape, different consumers: CloudFront / Akamai / Fastly all accept signed
          URLs, but the canonical-message format and signature encoding differ per vendor.
          This demo's license endpoint uses the same pattern.
        </p>
      </>
    ),
  },
  {
    slug: 'networking-basics',
    title: 'Networking primitives',
    blurb: 'TCP / UDP / QUIC, HTTP/1-2-3, TLS, byte range, CORS — the wire layer everything else rides on.',
    render: () => (
      <>
        <p>
          Every chapter from CDN onwards assumes the reader knows how the bytes get from
          origin to viewer. This chapter is that layer — what HTTP / TCP / UDP / TLS
          guarantee, what HTTP/2 + HTTP/3 changed, and the specific HTTP features (byte
          range, CORS) the streaming stack relies on.
        </p>

        <h3>TCP vs UDP vs QUIC</h3>
        <table className="docs-gaps">
          <thead><tr><th>Protocol</th><th>What it does</th></tr></thead>
          <tbody>
            <tr><td>TCP</td><td>Reliable byte stream. Guarantees in-order delivery; retries lost packets. Adds latency under packet loss. Substrate of HTTP/1.1 + HTTP/2.</td></tr>
            <tr><td>UDP</td><td>Unreliable datagrams. No retries, no ordering, no congestion control. Substrate for QUIC, SRT, RTP, WebRTC.</td></tr>
            <tr><td>QUIC</td><td>UDP-based but with reliability + congestion control built in. Multiplexed streams without head-of-line blocking. Substrate of HTTP/3.</td></tr>
          </tbody>
        </table>

        <h3>HTTP versions</h3>
        <p>
          Same semantics (GET, POST, headers, status codes), different wire format and
          connection behaviour:
        </p>
        <div className="docs-figure">
          <HttpVersionsFigure />
        </div>
        <ul>
          <li><strong>HTTP/1.1</strong> (1997) — one request per TCP connection at a time (pipelining never worked). Browsers open ~6 connections per origin. Plain text.</li>
          <li><strong>HTTP/2</strong> (2015) — binary framing on a single TCP connection. Multiplexed concurrent streams. Header compression. Server push (now deprecated). LL-HLS leans on it.</li>
          <li><strong>HTTP/3</strong> (2022) — same semantics as HTTP/2, but runs over QUIC (UDP). No TCP head-of-line blocking. 0-RTT resumption. Better on mobile / lossy networks.</li>
        </ul>

        <h3>TLS — encryption + identity</h3>
        <p>
          <strong>TLS</strong> wraps any transport in encryption + server authentication. The
          modern version is <strong>TLS 1.3</strong> (2018). The handshake establishes a
          shared symmetric key via Diffie-Hellman; the server proves it owns its hostname
          with a certificate signed by a Certificate Authority. After the handshake, all
          bytes are AES-GCM encrypted.
        </p>
        <p>
          TLS 1.3 is 1-RTT (one round trip before data flows) and supports 0-RTT for resumed
          sessions. CDN edges terminate TLS to save the origin from the handshake cost on
          every viewer.
        </p>

        <h3>HTTP byte range — partial GETs</h3>
        <p>
          Trick-play and CMAF need to fetch just part of a file. Standard HTTP:
        </p>
        <pre><code>{`GET /segment_001.ts HTTP/1.1
Range: bytes=48000-99999

HTTP/1.1 206 Partial Content
Content-Range: bytes 48000-99999/200000
Content-Length: 52000
[bytes]`}</code></pre>
        <p>
          Every CDN handles byte-range natively. The HLS{' '}
          <code>#EXT-X-BYTERANGE:length@offset</code> tag in an I-frame playlist resolves to
          this Range header.
        </p>

        <h3>CORS — cross-origin resource sharing</h3>
        <p>
          Browsers block cross-origin reads by default. To allow a page at{' '}
          <code>player.example.com</code> to fetch a segment at <code>cdn.example.net</code>,
          the CDN must respond with <code>Access-Control-Allow-Origin: *</code> (or the
          specific origin). For non-simple requests (custom headers, non-GET methods), the
          browser sends a <strong>preflight</strong> OPTIONS request first.
        </p>
        <p>
          Two places this bites OTT:
        </p>
        <ul>
          <li>SSAI: ad-service segments are served from a different origin than the program. Ad-service must send CORS headers.</li>
          <li>Bearer tokens: the player's <code>xhrSetup</code> shouldn't attach the program JWT to cross-origin segment requests — it leaks the token to whoever serves the segment.</li>
        </ul>

        <h3>DNS</h3>
        <p>
          Hostname resolution. For OTT, the load-bearing detail is that{' '}
          <strong>geo-routing</strong> often happens here — when a viewer queries{' '}
          <code>cdn.example.com</code>, the authoritative DNS returns the IP of the nearest
          CDN PoP based on the resolver's network. Multi-CDN routing is often a DNS-level
          switch via short-TTL CNAME records.
        </p>

        <h3>Connection lifecycle</h3>
        <p>
          Each new TCP+TLS connection costs 2-3 RTTs of handshake.{' '}
          <strong>Keep-alive</strong> (HTTP/1.1) and connection reuse (HTTP/2, HTTP/3) avoid
          re-handshaking per request — a big deal when a player fetches dozens of small
          segments per minute. Cold connection on slow Wi-Fi can easily add 500 ms of
          latency to the first frame.
        </p>
      </>
    ),
  },
  {
    slug: 'hls',
    title: 'HLS essentials',
    blurb: 'Manifests, segments, ABR — the streaming protocol underneath everything.',
    render: () => (
      <>
        <p>
          <strong>HLS</strong> (HTTP Live Streaming) is Apple's adaptive-bitrate protocol. The
          player loads a text manifest first, picks a rendition, and downloads short segments
          referenced from that manifest. Plain HTTP, infinitely cacheable on a CDN.
        </p>
        <h3>Two-layer manifest</h3>
        <p>
          A <strong>master playlist</strong> lists per-bitrate variants. A <strong>media playlist
          </strong> lists the segments for one variant. The player can switch between variants
          mid-stream — this is ABR (adaptive bitrate).
        </p>
        <div className="docs-figure">
          <HLSManifestFigure />
        </div>
        <pre><code>{`# master.m3u8
#EXTM3U
#EXT-X-STREAM-INF:BANDWIDTH=2400000,RESOLUTION=1280x720
720p/index.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x360
360p/index.m3u8`}</code></pre>
        <pre><code>{`# 720p/index.m3u8
#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:4
#EXT-X-MEDIA-SEQUENCE:0
#EXT-X-PLAYLIST-TYPE:VOD
#EXTINF:4.000000,
segment_000.ts
#EXTINF:4.000000,
segment_001.ts
#EXT-X-ENDLIST`}</code></pre>
        <h3>This demo's shortcut</h3>
        <p>
          For simplicity the backend emits a single-rendition manifest — no ladder, no per-bitrate
          subdirectories. The master playlist has just one variant. A real ABR ladder would
          transcode 360p / 480p / 720p / 1080p with matching keyframe-aligned segments.
        </p>
        <h3>Containers: .ts vs .m4s</h3>
        <p>
          Classic HLS uses <strong>MPEG-TS</strong> (.ts) segments. Modern HLS and DASH share a
          unified container called <strong>CMAF</strong> (fragmented MP4, .m4s). CMAF is now the
          recommended path because one set of segments can be referenced by both an .m3u8 and an
          .mpd manifest. This demo uses .ts because hls.js is universal.
        </p>
      </>
    ),
  },
  {
    slug: 'manifest',
    title: 'Manifest deep-dive',
    blurb: 'Every #EXT tag in an HLS playlist plus how DASH expresses the same ideas.',
    render: () => (
      <>
        <p>
          HLS essentials covered the two-layer concept. This chapter walks the tags individually
          and contrasts them with the DASH equivalents.
        </p>
        <h3>Master playlist</h3>
        <pre><code>{`#EXTM3U
#EXT-X-VERSION:6
#EXT-X-INDEPENDENT-SEGMENTS

#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="aac-en",NAME="English",
    DEFAULT=YES,AUTOSELECT=YES,LANGUAGE="en",URI="audio/en.m3u8"
#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="subs",NAME="English",
    DEFAULT=YES,LANGUAGE="en",URI="subs/en.m3u8"

#EXT-X-STREAM-INF:BANDWIDTH=2400000,RESOLUTION=1280x720,
    CODECS="avc1.64001f,mp4a.40.2",AUDIO="aac-en",SUBTITLES="subs"
720p/index.m3u8

#EXT-X-I-FRAME-STREAM-INF:BANDWIDTH=200000,RESOLUTION=1280x720,
    CODECS="avc1.64001f",URI="720p/iframes.m3u8"`}</code></pre>
        <ul>
          <li><code>#EXT-X-INDEPENDENT-SEGMENTS</code> — every segment starts with a keyframe; the player can switch at any boundary without rebuffering.</li>
          <li><code>#EXT-X-MEDIA</code> — alternate audio / subtitle / closed-caption tracks grouped together. Players surface them as language switchers.</li>
          <li><code>#EXT-X-STREAM-INF</code> — one per video rendition. <code>CODECS</code> is the strict RFC 6381 codec string the player uses to confirm it can decode without fetching.</li>
          <li><code>#EXT-X-I-FRAME-STREAM-INF</code> — separate I-frame-only playlist for fast trick-play (scrubbing, thumbnail strips).</li>
        </ul>
        <h3>Media playlist</h3>
        <pre><code>{`#EXTM3U
#EXT-X-VERSION:6
#EXT-X-TARGETDURATION:4
#EXT-X-MEDIA-SEQUENCE:0
#EXT-X-DISCONTINUITY-SEQUENCE:0
#EXT-X-PLAYLIST-TYPE:VOD
#EXT-X-MAP:URI="init.mp4"

#EXT-X-KEY:METHOD=AES-128,URI="license.key?...",IV=0x...
#EXT-X-PROGRAM-DATE-TIME:2026-06-19T10:00:00Z

#EXTINF:4.000,
segment_000.m4s
#EXTINF:4.000,
segment_001.m4s

#EXT-X-DISCONTINUITY
#EXT-X-DATERANGE:ID="ad-1",CLASS="ad",
    START-DATE="2026-06-19T10:00:08Z",DURATION=12.0
#EXTINF:4.000,
ad_000.m4s
#EXTINF:4.000,
ad_001.m4s
#EXTINF:4.000,
ad_002.m4s
#EXT-X-DISCONTINUITY

#EXTINF:4.000,
segment_002.m4s

#EXT-X-ENDLIST`}</code></pre>
        <ul>
          <li><code>#EXT-X-TARGETDURATION</code> — upper bound on segment duration. Player polls the playlist at half this for live.</li>
          <li><code>#EXT-X-MEDIA-SEQUENCE</code> — first segment's sequence number. Increments forever for live as old segments drop off the window.</li>
          <li><code>#EXT-X-PLAYLIST-TYPE</code> — VOD (finite, has ENDLIST) or EVENT (live but appendable; manifest only grows).</li>
          <li><code>#EXT-X-MAP</code> — init segment (the MP4 'ftyp' + 'moov' boxes) needed before any media segment.</li>
          <li><code>#EXT-X-KEY</code> — the encryption preamble. Applies to all following segments until the next KEY tag.</li>
          <li><code>#EXT-X-PROGRAM-DATE-TIME</code> — wall-clock anchor. Lets the player compute "current live edge" and "you joined 5s late".</li>
          <li><code>#EXT-X-DISCONTINUITY</code> + <code>#EXT-X-DATERANGE</code> — what this demo's SSAI writes around an ad break.</li>
          <li><code>#EXT-X-ENDLIST</code> — VOD only. Tells the player "no more segments coming".</li>
        </ul>
        <h3>LL-HLS tags</h3>
        <p>
          Low-Latency HLS adds partial-segment delivery. <code>#EXT-X-PART-INF</code> declares
          partial duration, <code>#EXT-X-PART</code> lists partials inside an in-progress
          segment, <code>#EXT-X-PRELOAD-HINT</code> nudges the player to request the next
          partial before it's even listed.
        </p>
        <h3>DASH equivalent</h3>
        <pre><code>{`<MPD type="dynamic" minimumUpdatePeriod="PT2S" ...>
  <Period start="PT0S">
    <AdaptationSet contentType="video" segmentAlignment="true">
      <Representation id="720p" bandwidth="2400000" codecs="avc1.64001f">
        <SegmentTemplate timescale="1000" duration="4000"
          media="720p/seg_$Number$.m4s" initialization="720p/init.m4s" />
      </Representation>
    </AdaptationSet>
    <AdaptationSet contentType="audio" lang="en">
      ...
    </AdaptationSet>
  </Period>
</MPD>`}</code></pre>
        <p>
          Hierarchy: <strong>Period</strong> (a chapter or ad break) → <strong>AdaptationSet
          </strong> (one media type — video, audio, subtitles) → <strong>Representation</strong>
          {' '}(one bitrate / codec variant) → <strong>SegmentTemplate</strong> or{' '}
          <strong>SegmentList</strong> (where to find the bytes). CMAF lets one set of .m4s
          files serve both an HLS .m3u8 and a DASH .mpd.
        </p>
      </>
    ),
  },
  {
    slug: 'containers',
    title: 'Containers',
    blurb: 'MP4, MKV, MOV, TS — what each wrapper actually does, and why streaming picked the ones it did.',
    render: () => (
      <>
        <p>
          A <strong>container</strong> (or <em>wrapper</em>) is the file format that holds the
          elementary streams — video, audio, subtitles, metadata — alongside an index that tells
          a player where each piece starts. The container is NOT the codec: an .mp4 file can
          carry H.264, H.265 or AV1 video; an .mkv file can carry literally any codec the player
          understands. Mismatching the two is the source of "the file plays in VLC but not in
          Safari" frustration — usually Safari supports the container but not the codec inside.
        </p>
        <div className="docs-figure">
          <ContainerStructureFigure />
        </div>
        <h3>Common containers</h3>
        <table className="docs-gaps">
          <thead>
            <tr>
              <th>Container</th>
              <th>Where it lives</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>MP4 (.mp4) — ISO BMFF</td>
              <td>The web / download workhorse. Universal hardware decode, indexed for fast seek. Backbone of OTT downloads, social media, the HTML5 <code>&lt;video&gt;</code> tag.</td>
            </tr>
            <tr>
              <td>MOV (.mov) — QuickTime</td>
              <td>Apple's predecessor to MP4 (ISO BMFF descended from MOV — they share most of the box structure). Common from Apple encoders, ProRes mezzanines, iPhone recordings.</td>
            </tr>
            <tr>
              <td>MKV (.mkv) — Matroska</td>
              <td>Open, extensible, carries anything: every codec, multiple audio + subtitle tracks, chapters. Dominant for desktop ripping, Plex / Jellyfin libraries, encoder testing — rarely shipped to consumers.</td>
            </tr>
            <tr>
              <td>WebM (.webm)</td>
              <td>Matroska subset locked to royalty-free codecs (VP8 / VP9 / AV1 + Vorbis / Opus). Browser <code>MediaRecorder</code> defaults to it. YouTube and Twitter publish in it.</td>
            </tr>
            <tr>
              <td>MPEG-TS (.ts)</td>
              <td>188-byte packetized stream designed for broadcast satellite. Picked up by classic HLS for its alignment friendliness. Still the default for live OTT today.</td>
            </tr>
            <tr>
              <td>fMP4 / CMAF (.m4s)</td>
              <td>MP4 split into self-describing fragments. Modern HLS and DASH share this; one set of segments serves both manifests. Replacing .ts in production VOD.</td>
            </tr>
            <tr>
              <td>3GP (.3gp)</td>
              <td>Mobile-era ISO BMFF subset (smaller boxes, mono audio profiles). Most relevant on legacy feature phones in emerging markets; the codec / container that <em>still</em> ships on bottom-tier Android.</td>
            </tr>
            <tr>
              <td>MXF (.mxf)</td>
              <td>Professional broadcast — tape replacement. SMPTE-standard, complex, used by editorial and contribution links. Never reaches the viewer.</td>
            </tr>
            <tr>
              <td>AVI (.avi) — legacy</td>
              <td>Microsoft's 1992 container. Very forgiving of arbitrary codecs but lacks a proper duration / fragment index. Replaced by MP4 / MKV in every modern context.</td>
            </tr>
            <tr>
              <td>FLV (.flv) — legacy</td>
              <td>Old Flash Video. Effectively dead since Flash sunsetted in 2020. Mentioned because some legacy ingest stacks still emit it.</td>
            </tr>
          </tbody>
        </table>
        <h3>Container vs codec, in one example</h3>
        <p>
          An iPhone records H.264 video + AAC audio inside a .mov container. To put it on a
          website you can <code>ffmpeg -i input.mov -c copy output.mp4</code> — same codecs,
          different wrapper, no re-encoding (a "remux"). To target an older Android chipset you
          might then <code>ffmpeg -i output.mp4 -c:v libx264 -profile:v baseline -c:a aac output_compat.mp4</code>
          {' '}— this time re-encoding the video into the H.264 baseline profile because the
          chipset can't decode high.
        </p>
        <h3>What this demo uses</h3>
        <p>
          Uploads are accepted as any browser-recognised <code>video/*</code> MIME — usually
          .mp4 from a phone, sometimes .mov. FFmpeg transcodes to H.264 / AAC and packages as
          {' '}<strong>MPEG-TS</strong> segments inside an HLS manifest; the ad-service does the
          same. A production system in 2026 would prefer <strong>CMAF</strong> .m4s, but .ts is
          still what hls.js and native HLS work with by default.
        </p>
      </>
    ),
  },
  {
    slug: 'codecs',
    title: 'Codecs',
    blurb: 'How H.264, H.265, AV1, AAC and friends turn raw frames into bits — and how to pick one.',
    render: () => (
      <>
        <p>
          A <strong>codec</strong> is an encoder + decoder pair. The encoder turns raw audio
          samples / video frames into a compressed bitstream; the decoder runs the same
          algorithm in reverse. Compression is <em>lossy</em> almost everywhere in OTT — the
          decoder reconstructs an <strong>approximation</strong> of the source. Lossless modes
          exist (FFV1, FLAC) but produce files an order of magnitude bigger, only used in
          archival.
        </p>
        <h3>How video codecs compress</h3>
        <p>
          Three classes of frame: <strong>I-frame</strong> (intra-coded, standalone like a JPEG),{' '}
          <strong>P-frame</strong> (predicted from previous I/P), <strong>B-frame</strong>{' '}
          (bidirectionally predicted from frames in both directions). A <strong>GOP</strong>{' '}
          (Group of Pictures) is the distance from one I-frame to the next; each HLS segment
          must start on an I-frame, so the GOP length sets the minimum segment duration. Inside
          a frame, the codec splits into blocks, transforms them (DCT, integer transforms),
          quantises (the lossy step), and entropy-codes the residual.
        </p>
        <div className="docs-figure">
          <GOPFramesFigure />
        </div>
        <h3>Video codecs</h3>
        <p>
          Each generation aims to shrink the file at the same visual quality (~30-50% on the
          predecessor). Adoption lags because hardware decoders catch up slowly and patent
          pools delay every transition.
        </p>
        <div className="docs-figure">
          <CodecEfficiencyFigure />
        </div>
        <table className="docs-gaps">
          <thead>
            <tr>
              <th>Codec</th>
              <th>Position</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>H.264 / AVC (2003)</td>
              <td>The streaming workhorse. Universal hardware decode (every phone, TV, browser since 2011). Licensed via MPEG LA pool but cost is amortised everywhere. What this demo uses (FFmpeg's <code>libx264</code>).</td>
            </tr>
            <tr>
              <td>H.265 / HEVC (2013)</td>
              <td>~50% smaller files than H.264 at equal quality. Required for 4K HDR on most platforms. Adoption was slow because of split patent pools (MPEG LA + HEVC Advance + Velos Media) — three separate royalty stacks.</td>
            </tr>
            <tr>
              <td>VP9 (2013)</td>
              <td>Google's royalty-free codec, similar efficiency to HEVC. Heavy use inside YouTube and Google Meet. Native in Chrome / Firefox / Android. Less hardware decode coverage outside Google's ecosystem.</td>
            </tr>
            <tr>
              <td>AV1 (2018)</td>
              <td>Alliance for Open Media's successor to VP9. ~30% smaller than HEVC, fully royalty-free. Native in Chrome, Firefox, Edge, Android 10+. Encoders (<code>libaom-av1</code>, <code>SVT-AV1</code>) are dramatically slower than x264.</td>
            </tr>
            <tr>
              <td>H.266 / VVC (2020)</td>
              <td>Next-gen MPEG codec. ~40% smaller than HEVC. Adoption blocked by yet another fragmented patent pool; very limited browser / hardware support in 2026.</td>
            </tr>
            <tr>
              <td>MPEG-2 (1995) — legacy</td>
              <td>The DVD / cable / satellite codec. Replaced everywhere by H.264 except in legacy linear broadcast streams you might still ingest from.</td>
            </tr>
          </tbody>
        </table>
        <h3>Audio codecs</h3>
        <table className="docs-gaps">
          <thead>
            <tr>
              <th>Codec</th>
              <th>Position</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>AAC (1997) — MPEG-4 Audio</td>
              <td>The streaming default. HLS expects it. Universal hardware decode. Variants: AAC-LC (the usual), HE-AAC (for low bitrates), xHE-AAC (newer, smoother loudness). What this demo uses.</td>
            </tr>
            <tr>
              <td>Opus (2012)</td>
              <td>Royalty-free, IETF-standardised. Best-in-class for both speech and music. Default for WebRTC; allowed inside CMAF + DASH. Less universal hardware support than AAC.</td>
            </tr>
            <tr>
              <td>AC-3 / E-AC-3 (1992 / 2005)</td>
              <td>Dolby Digital and Digital Plus. The surround codecs CTV apps pass through to the TV's Dolby decoder. E-AC-3 carries Atmos objects.</td>
            </tr>
            <tr>
              <td>MP3 (1993)</td>
              <td>Legacy. Universal, but worse compression than AAC at the same bitrate. Patents expired in 2017 so still appears in user-uploaded content; not used as a streaming target.</td>
            </tr>
            <tr>
              <td>FLAC (2001) — lossless</td>
              <td>Bit-exact reconstruction. Used by archival workflows and audiophile streaming tiers (Apple Music Lossless, Tidal HiFi). Files are 4–6x bigger than AAC.</td>
            </tr>
          </tbody>
        </table>
        <h3>How to pick</h3>
        <p>
          Four trade-offs always show up: <strong>compression efficiency</strong> (bytes saved at
          equal quality), <strong>decode cost</strong> (CPU / battery to play back),{' '}
          <strong>encode cost</strong> (how slow + expensive to produce), and{' '}
          <strong>licensing</strong> (patent royalties + decoder fees). In 2026 the practical
          calls look like:
        </p>
        <ul>
          <li><strong>Universal compatibility:</strong> H.264 + AAC, the path this demo takes.</li>
          <li><strong>Premium VOD targeting modern devices:</strong> dual ladder H.264 (legacy) + HEVC or AV1 (everyone else), with AAC for everything and AC-3 / E-AC-3 / Atmos for surround on CTV.</li>
          <li><strong>Pure royalty-free:</strong> AV1 + Opus inside WebM (browsers + Android) or CMAF (everyone else, once hardware lands).</li>
          <li><strong>Low latency:</strong> Opus for audio (12 ms vs AAC's 60 ms framing); H.264 or AV1 video with short GOPs.</li>
        </ul>
        <h3>What this demo uses</h3>
        <p>
          FFmpeg defaults: <code>libx264</code> for video (medium preset, single rendition for
          simplicity), <code>aac</code> for audio at ~128 kbps stereo. Output is packaged into
          MPEG-TS segments inside an HLS manifest. A production ladder would re-encode the same
          source at 360p / 480p / 720p / 1080p with keyframe-aligned GOPs and signal them in the
          master playlist.
        </p>
      </>
    ),
  },
  {
    slug: 'transcode-package',
    title: 'Transcoding & packaging',
    blurb: "What FFmpeg actually does between UPLOAD and SSAI — the encode step and the wrap-into-HLS step that production normally splits.",
    render: () => (
      <>
        <p>
          The two middle stages of the publishing pipeline get conflated all the time, but they
          do different jobs and production systems usually run them in separate processes.
          {' '}<strong>Transcoding</strong> re-encodes the source bitstream into delivery codecs
          and bitrates. <strong>Packaging</strong> wraps those bitstreams in a streaming
          container and writes the manifest a player can load.
        </p>

        <h3>Transcoding</h3>
        <p>
          The raw upload could be anything — a phone clip in H.264 + AAC, a ProRes mezzanine
          from an editor, an H.265 4K capture from a drone. None of those shapes work for
          delivery: ProRes is too big, H.265 isn't supported on enough devices, the source
          bitrate doesn't suit slow Wi-Fi. Transcoding produces one or more
          {' '}<strong>renditions</strong> — same content, each encoded with a specific codec at
          a specific resolution and bitrate. The set of renditions you offer is the production
          {' '}<strong>ABR ladder</strong>:
        </p>
        <div className="docs-figure">
          <ABRLadderFigure />
        </div>
        <p>
          Two non-obvious requirements bind the ladder together:
        </p>
        <ul>
          <li>
            <strong>Keyframe alignment.</strong> Every rendition must have I-frames at the same
            timestamps. Otherwise the player can't switch up or down at a segment boundary
            without rebuffering. FFmpeg: <code>-force_key_frames "expr:gte(t,n_forced*4)"</code>.
          </li>
          <li>
            <strong>Constant segment duration.</strong> Same target segment length across the
            ladder (typically 2–6 s). Shorter = lower latency + faster ABR response, longer =
            better compression and lower CDN request volume.
          </li>
        </ul>
        <p>
          Production hard parts the demo skips: hardware acceleration (NVENC / Intel QSV / AMF
          for ~10× encode throughput), <strong>per-title encoding</strong> (Netflix-style
          analysis to pick a per-title bitrate ladder instead of a fixed one), two-pass encodes
          for quality at low bitrate, content-aware HDR-to-SDR fallback, and audio loudness
          normalisation (-23 LUFS).
        </p>

        <h3>Packaging</h3>
        <p>
          Once you have encoded bitstreams, the packager wraps them in a streaming container
          and writes the manifest. Two main outputs:
        </p>
        <ul>
          <li><strong>HLS:</strong> master playlist (.m3u8) + per-rendition media playlists + segments (.ts or .m4s).</li>
          <li><strong>DASH:</strong> single manifest (.mpd) + segments (typically .m4s).</li>
        </ul>
        <p>
          Modern packagers emit <strong>CMAF</strong> .m4s segments and reference the same files
          from both an HLS manifest and a DASH manifest — one set of bytes, two players. That
          halves origin storage and CDN cache footprint.
        </p>
        <p>
          Common dedicated packagers:
        </p>
        <ul>
          <li><strong>Shaka Packager</strong> (Google, open-source) — HLS / DASH / CMAF, Widevine + FairPlay + PlayReady DRM.</li>
          <li><strong>Bento4</strong> — toolkit for MP4 / DASH / HLS, lots of mp4* CLIs.</li>
          <li><strong>AWS MediaPackage</strong> / <strong>Mux</strong> / <strong>Wowza</strong> — hosted packagers in front of a CDN.</li>
        </ul>

        <h3>Just-in-time (JIT) packaging</h3>
        <p>
          Pre-packaging every variant means N copies on disk (HLS + DASH × codecs × bitrates ×
          DRM combinations — easily 30× the source). <strong>JIT packaging</strong> stores a
          single high-quality mezzanine, runs the packager only when a viewer asks for a
          specific variant, caches the result at the CDN. AWS MediaPackage and Mux are JIT under
          the hood.
        </p>

        <h3>What this demo does</h3>
        <p>
          The demo collapses both stages into a single FFmpeg call per asset. <code>TranscodeWorker</code>
          shells out with arguments that say "decode the upload, encode H.264 + AAC, package
          into HLS, write segments + master.m3u8 to <code>data/processed/&lt;assetId&gt;/</code>".
          {' '}<code>PackagingWorker</code> then does light bookkeeping (record the package dir
          on the asset row) — the heavy lifting already happened.
        </p>
        <p>
          That works for one rendition and one delivery format. Adding an ABR ladder would mean
          either six FFmpeg invocations (one per rendition) or one big invocation with multiple{' '}
          <code>-map</code> + <code>-c:v:N</code> + <code>-b:v:N</code> blocks. Adding DASH on
          top of HLS would mean a second packaging pass, or moving to a dedicated packager like
          Shaka.
        </p>
      </>
    ),
  },
  {
    slug: 'ssai',
    title: 'Server-Side Ad Insertion',
    blurb: "How the backend stitches the ad-service's pre-roll into the program manifest.",
    render: () => (
      <>
        <p>
          With <strong>CSAI</strong> (Client-Side Ad Insertion), the player fetches an ad tag,
          loads the ad creative, pauses the program, plays the ad, then resumes. Ad blockers can
          short-circuit any of those steps. With <strong>SSAI</strong>, the ad segments are stitched
          straight into the program manifest at publish time — the player sees one continuous stream
          and can't tell which segments are ads.
        </p>
        <h3>The flow</h3>
        <div className="docs-figure">
          <SSAISequenceFigure />
        </div>
        <ol>
          <li>
            Backend's <code>SsaiWorker</code> calls <code>GET /vast?adId=preroll-brand-a</code> on
            the ad-service. Response is a VAST 4.2 XML describing the ad: creative URL, duration,
            impression / click-through pixels.
          </li>
          <li>
            Ad-service runs FFmpeg on the fly to produce the ad's HLS rendition (master + ts
            segments), caches the result on disk. Subsequent VAST hits skip the FFmpeg run.
          </li>
          <li>
            Backend pulls the ad's media playlist and prepends its segments to the program's
            media playlist, then writes an <strong>EXT-X-DATERANGE</strong> tag marking the ad
            block's start time and duration.
          </li>
          <li>
            The stitched manifest is what the player loads. Ad ts URLs point back at the
            ad-service over CORS; program ts URLs stay on the backend.
          </li>
        </ol>
        <h3>Ad-cue tag: EXT-X-DATERANGE</h3>
        <p>
          This demo uses Apple's modern <code>#EXT-X-DATERANGE</code> tag with a custom
          <code>CLASS="ad"</code> and a <code>DURATION</code>. The player reads it on the
          MANIFEST_PARSED event and locks the seek bar for the ad's duration (see
          <code>HlsPlayer.tsx</code>). Older players that only understand
          <code>#EXT-X-CUE-OUT</code> / <code>#EXT-X-CUE-IN</code> would miss it — production
          stitchers often emit both for compatibility.
        </p>
        <h3>What real SSAI vendors do extra</h3>
        <ul>
          <li>
            <strong>Per-viewer manifests.</strong> Each viewer gets a manifest stitched with a
            personalized ad selection — same program, different ads.
          </li>
          <li>
            <strong>SCTE-35 cues from the encoder.</strong> Live SSAI inserts dynamic ad breaks
            signalled by SCTE-35 markers inside the MPEG-TS stream itself.
          </li>
          <li>
            <strong>Ad transcoding.</strong> Ads must match the program's codec, resolution and
            audio layout — otherwise the player rebuffers at the boundary.
          </li>
        </ul>
      </>
    ),
  },
  {
    slug: 'drm',
    title: 'DRM-lite vs production DRM',
    blurb: 'How the demo protects content, and how Widevine / FairPlay / PlayReady differ.',
    render: () => (
      <>
        <p>
          This demo encrypts every HLS segment with <strong>AES-128</strong> and gates the key
          behind a viewer-bound, time-bound, single-use signed URL. It is intentionally NOT a
          production DRM — see the comparison at the end. It is, however, the same shape: <em>
          opaque encrypted segments + a separate "license" path the server controls</em>.
        </p>
        <div className="docs-figure">
          <DRMLiteFlowFigure />
        </div>
        <h3>What the player sees</h3>
        <pre><code>{`#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:4
#EXT-X-KEY:METHOD=AES-128,
    URI="license.key?user=admin&exp=1781798175&nonce=…&sig=…",
    IV=0x...
#EXTINF:4.000000,
segment_000.ts
#EXT-X-ENDLIST`}</code></pre>
        <p>
          The <code>URI</code> on <code>#EXT-X-KEY</code> is generated freshly for the requesting
          viewer at manifest fetch time. The path itself is open (no Bearer required) — the URL
          itself is the credential.
        </p>
        <h3>HMAC signature anatomy</h3>
        <ul>
          <li><code>user</code> — the JWT subject that requested the manifest</li>
          <li><code>exp</code> — Unix timestamp after which the key returns 410 Gone</li>
          <li><code>nonce</code> — random 16 bytes, claimed once by <code>NonceStore</code></li>
          <li><code>sig</code> — HMAC-SHA256 of (user, exp, nonce) under the license-signing secret</li>
        </ul>
        <p>
          The signing secret is separate from the JWT secret (see
          <code>application.yml</code>). A leak of either does not compromise the other.
        </p>
        <h3>Production DRM landscape</h3>
        <p>
          Real OTT DRM uses <strong>EME</strong> (the browser API) + a <strong>CDM</strong>
          (Content Decryption Module) baked into the player / OS. The three commercial CDMs:
        </p>
        <ul>
          <li><strong>Widevine</strong> (Google) — Chrome, Firefox, Edge, Android.</li>
          <li><strong>FairPlay</strong> (Apple) — Safari, iOS, tvOS.</li>
          <li><strong>PlayReady</strong> (Microsoft) — Edge legacy, Xbox, Windows, many smart TVs.</li>
        </ul>
        <p>
          A <strong>CENC</strong>-encrypted bitstream is consumable by all three (FairPlay needs
          a small workaround), so providers ship one encrypted set of segments and three license
          servers. The license server returns a binary blob the CDM uses to derive segment keys.
          The plaintext never leaves the CDM's trusted environment.
        </p>
        <p>
          This demo would map to: AES-128 + HMAC URL → license server, hls.js → CDM, browser → EME.
          Production gives you four things the demo can't: device-level key handling, hardware
          decryption paths, robust output protection (HDCP), and an actual studio-grade audit
          trail. Demo gives you: clarity, ~150 lines of code, and zero patent licensing.
        </p>
      </>
    ),
  },
  {
    slug: 'anti-piracy',
    title: 'Anti-piracy beyond DRM',
    blurb: 'HDCP, forensic watermarking, screen-capture detection, geofencing, account sharing.',
    render: () => (
      <>
        <p>
          DRM encrypts the bytes and gates the key. That stops file copy + replay. It doesn't
          stop a viewer pointing a 4K camera at a TV, or a CDM exploit dumping decrypted frames
          out of memory. Real OTT layers more on top.
        </p>
        <h3>Output protection — HDCP</h3>
        <p>
          <strong>HDCP</strong> (High-bandwidth Digital Content Protection) encrypts the link
          between source (set-top, dongle, browser) and display. Studios mandate HDCP levels
          per content tier:
        </p>
        <ul>
          <li><strong>HDCP 2.2</strong> — required for 4K HDR and Dolby Vision.</li>
          <li><strong>HDCP 1.4</strong> — required for HD.</li>
          <li>None — SD only.</li>
        </ul>
        <p>
          If the player can't negotiate the required HDCP version with the connected display,
          the license server can refuse to issue the key — or issue a key that only unlocks an
          SD rendition. iOS / Android enforce this at the OS level; browsers query through
          EME's <code>MediaKeyStatus</code>.
        </p>
        <h3>Forensic watermarking</h3>
        <p>
          A per-viewer identifier embedded subtly in the video itself. Two approaches:
        </p>
        <ul>
          <li><strong>Pre-baked A/B variants.</strong> Encode bit-shifted versions of every segment; the per-viewer manifest stitches a unique sequence (segment 0 = variant A, 1 = variant B...). A 30-bit ID needs 30 segments — easy in a VOD movie.</li>
          <li><strong>Server-side watermark.</strong> Insert the per-viewer ID into the bitstream at packaging time. More CPU at packaging, less storage.</li>
        </ul>
        <div className="docs-figure">
          <ForensicWatermarkFigure />
        </div>
        <p>
          When a leak appears on a piracy site, the studio runs a forensic tool over the
          captured frames, recovers the ID, traces it back to the account, terminates and
          pursues.
        </p>
        <h3>Screen-capture & runtime protection</h3>
        <ul>
          <li><strong>iOS</strong> — <code>UIScreen.isCaptured</code> tells the app the screen is being mirrored / recorded; the player blanks the video.</li>
          <li><strong>Android</strong> — <code>FLAG_SECURE</code> on the player window blocks <code>screenrecord</code>, screenshots, casting.</li>
          <li><strong>Widevine L1</strong> — keys never reach userland; decryption happens in TEE (TrustZone). L3 (software-only) is allowed for SD but blocked for HD.</li>
          <li><strong>FairPlay + HDCP</strong> — Safari blanks the canvas if you try to read pixels off the video element.</li>
        </ul>
        <h3>Token-signed URLs</h3>
        <p>
          Manifests and segments served from a CDN are guarded by short-lived signed URLs (or
          signed cookies). The CDN validates the signature at the edge before serving — no
          origin round-trip. CloudFront, Akamai, Fastly all support this. Signing key rotation
          is typically every 15 min for streaming.
        </p>
        <h3>Geofencing</h3>
        <p>
          Per-asset country allowlist or denylist, consulted at license-issue time. IP
          geolocation is the standard signal (MaxMind, IPinfo). VPN detection is the eternal
          adversarial game: residential IP databases, latency profiling, and "no ASN we
          recognise" all flag suspect traffic. License denies, player shows the "not available
          in your region" wall.
        </p>
        <h3>Concurrent stream & account sharing</h3>
        <p>
          Concurrent-stream limits enforced at license-issue time (the license server keeps a
          per-account active-stream ledger). Account sharing detection looks at deeper signals
          — device fingerprint diversity, geographic centroid of usage, login patterns,
          time-of-day clustering — and downgrades or challenges suspected shared accounts.
          Netflix's 2023 crackdown is the canonical example.
        </p>
      </>
    ),
  },
  {
    slug: 'auth',
    title: 'Auth & session',
    blurb: 'JWT, refresh tokens, the typ claim, and how change-password keeps you signed in.',
    render: () => (
      <>
        <p>
          Auth in this demo is self-signed <strong>HS256 JWT</strong>: backend mints an access
          token (15 min) and a refresh token (24 h) on login. Both are HS256-signed with the same
          secret but carry a distinguishing <code>typ</code> claim — <code>access</code> vs
          <code>refresh</code>.
        </p>
        <div className="docs-figure">
          <AuthRefreshFlowFigure />
        </div>
        <h3>Why two decoders</h3>
        <p>
          The backend wires <strong>two</strong> <code>JwtDecoder</code> beans, each with an{' '}
          <code>OAuth2TokenValidator&lt;Jwt&gt;</code> that enforces a specific <code>typ</code>.
          The access decoder is <code>@Primary</code> so <code>oauth2ResourceServer.jwt()</code>
          picks it up; the refresh decoder is qualified explicitly on the
          <code>/auth/refresh</code> handler. This blocks a refresh token from being used as a
          Bearer header on protected APIs — a common bug when the rejection happens at
          authorities-conversion time (returning empty authorities still authenticates the
          request, the <code>@PreAuthorize</code> matcher is what 403s, and a frontend interceptor
          that only redirects on 401 silently sends the user nowhere).
        </p>
        <h3>Revocation: token_version</h3>
        <p>
          Every issued JWT embeds a <code>tv</code> claim equal to the user row's current{' '}
          <code>token_version</code>. <code>JwtTokenVersionFilter</code> looks up the live value
          (Caffeine-cached for 30 s) on every authenticated request; a mismatch clears the security
          context. Bumping the user's <code>token_version</code> invalidates every still-valid
          token issued before the bump.
        </p>
        <h3>Change-password stays signed in</h3>
        <p>
          When the user changes their password, the backend bumps <code>token_version</code> —
          which would 401 the same tab on its next API call. To avoid the bounce-through-login
          experience, <code>/auth/change-password</code> returns a fresh access + refresh pair
          stamped with the new <code>tv</code>; the SPA calls <code>setSession()</code> with it.
        </p>
        <h3>Refresh flow on 401</h3>
        <p>
          The client's <code>authedFetch</code> wrapper catches 401, tries{' '}
          <code>/auth/refresh</code>, installs the new pair, retries the original request.{' '}
          <code>inflightRefresh</code> coalesces concurrent 401s so multiple in-flight requests
          share one refresh.
        </p>
      </>
    ),
  },
  {
    slug: 'cdn',
    title: 'CDN & delivery network',
    blurb: 'Edge cache hierarchy, multi-CDN, token signing, edge compute — what production OTT runs on.',
    render: () => (
      <>
        <p>
          Origin servers don't scale to global viewer counts. A <strong>CDN</strong> (Content
          Delivery Network) caches the manifest and segments at edge points-of-presence (PoPs)
          close to the viewer, minimising round-trip time and offloading bandwidth from the
          origin. Every production OTT system runs behind one — usually two.
        </p>
        <h3>Cache hierarchy</h3>
        <ol>
          <li><strong>Origin</strong> — your backend / packager. Single source of truth.</li>
          <li><strong>Origin shield</strong> — a single CDN PoP that wraps the origin so concurrent edge misses collapse to one origin request.</li>
          <li><strong>Tier-2 / regional PoPs</strong> — large mid-tier caches feeding edges in their region.</li>
          <li><strong>Tier-1 / edge PoPs</strong> — what viewers actually connect to. Usually hundreds globally.</li>
        </ol>
        <div className="docs-figure">
          <CDNCacheFigure />
        </div>
        <p>
          For VOD a popular asset reaches near-100% edge cache hit rate. For live the moving
          edge is harder: every viewer wants the latest segment, and the cache is cold for
          ~the segment's duration after each new segment lands.
        </p>
        <h3>Cache key design</h3>
        <ul>
          <li><strong>Per-viewer SSAI manifest.</strong> Each viewer's manifest is uniquely stitched — cache hit rate is 0% by construction. Mitigation: vendor stitchers emit a manifest cache key that strips per-viewer URLs so the rest is shareable.</li>
          <li><strong>Signed-URL query strings.</strong> If the signature lives in the query and the CDN keys on full URL, every signed-URL refresh misses cache. Strip the signature from the cache key.</li>
        </ul>
        <h3>Multi-CDN strategy</h3>
        <p>
          Single-CDN is single-point-of-failure plus single-point-of-pricing. Multi-CDN systems
          route per-session based on real-time signals: throughput from the player (CMCD),
          latency probes, regional outages, current cost tier. <strong>Conviva</strong> and{' '}
          <strong>NPAW</strong> both sell this. The router emits a different CDN host in the
          session's manifest URL.
        </p>
        <h3>Edge compute</h3>
        <p>
          Modern CDNs run small workers at the edge — <strong>CloudFront Functions</strong>,{' '}
          <strong>Lambda@Edge</strong>, <strong>Akamai EdgeWorkers</strong>,{' '}
          <strong>Fastly Compute</strong>. Useful in OTT for:
        </p>
        <ul>
          <li>Token rewrite — refresh a signed URL on hit without round-tripping to origin.</li>
          <li>Geo redirect — route an EU viewer to an EU origin.</li>
          <li>Manifest manipulation — inject per-viewer watermark IDs, strip ad cues for live.</li>
          <li>SSAI itself — vendor-managed ad insertion at the edge.</li>
        </ul>
        <h3>Token-signed URLs</h3>
        <p>
          CloudFront / Akamai / Fastly all support edge-validated signed URLs. The signature
          encodes expiry + optionally IP + path; the CDN validates at edge before serving.
          Two delivery modes: query-string signature (every URL signed) or signed cookies
          (one cookie covers many URLs under a path).
        </p>
        <h3>Cost</h3>
        <p>
          CDN egress dominates streaming P&amp;L. Order of magnitude in 2026:
        </p>
        <ul>
          <li>AWS CloudFront: $0.085/GB at low volume, ~$0.02/GB negotiated at scale.</li>
          <li>Cloudflare: $0 egress on R2 → Bandwidth Alliance partners.</li>
          <li>Akamai / Fastly: enterprise-quoted, typically $0.005–0.02/GB at OTT scale.</li>
        </ul>
        <p>
          A 5 Mbps stream is ~2.25 GB/hr. One million viewer-hours at $0.02/GB = $45,000.
          That's why cache hit rate, codec efficiency and ABR ladder design directly translate
          to operating margin.
        </p>
        <h3>What this demo does</h3>
        <p>
          Backend serves segments directly to the browser. No CDN, no edge cache, no signed-URL
          complexity. Fine for one viewer on localhost; falls over at the first thousand-viewer
          spike.
        </p>
      </>
    ),
  },
  {
    slug: 'player',
    title: 'Player & client architecture',
    blurb: 'HTMLMediaElement, MSE, EME, ABR algorithms — what hls.js actually does for you.',
    render: () => (
      <>
        <p>
          Browser-based playback rides on a three-layer browser API stack with a JavaScript
          player on top.
        </p>
        <h3>The browser stack</h3>
        <div className="docs-figure">
          <PlayerStackFigure />
        </div>
        <ul>
          <li><strong>HTMLMediaElement</strong> — the <code>&lt;video&gt;</code> tag itself. Exposes <code>play()</code>, <code>currentTime</code>, events (timeupdate, waiting, ended, error). Knows nothing about HLS / DASH directly except on Safari (native HLS).</li>
          <li><strong>MSE</strong> (Media Source Extensions, 2016 W3C). The JS player creates a <code>MediaSource</code>, attaches it to the video element, fetches segments itself, appends them to a <code>SourceBuffer</code>. Browser handles demux + decode + render.</li>
          <li><strong>EME</strong> (Encrypted Media Extensions). When the player encounters encrypted segments it asks for a license via <code>navigator.requestMediaKeySystemAccess()</code>; the browser routes the request to a CDM (Widevine / FairPlay / PlayReady) that holds the keys in a trusted environment and decrypts in-place.</li>
        </ul>
        <h3>Common JS players</h3>
        <table className="docs-gaps">
          <thead><tr><th>Player</th><th>What it covers</th></tr></thead>
          <tbody>
            <tr><td>hls.js</td><td>HLS-only. Lightweight, used in this demo. Handles MSE, ABR, EME for Widevine. Doesn't speak DASH.</td></tr>
            <tr><td>shaka-player</td><td>Google's player. HLS + DASH + CMAF, full EME (Widevine + FairPlay + PlayReady), offline storage. Heavier.</td></tr>
            <tr><td>video.js + plugins</td><td>UI-first framework. Wraps hls.js / shaka under the hood via plugins. Drop-in for legacy sites that already use it.</td></tr>
            <tr><td>dash.js</td><td>Reference DASH implementation. Less polished than shaka-player.</td></tr>
          </tbody>
        </table>
        <h3>iOS / Safari quirk</h3>
        <p>
          Until iOS 17 (2023), MSE wasn't available on Safari iOS — the only way to play HLS
          was the native <code>&lt;video src="*.m3u8"&gt;</code> path. That means hls.js /
          shaka don't run on iPhone of that era; you fall back to setting <code>video.src</code>
          {' '}directly. EME on FairPlay similarly differs — the license request and response
          shapes are FairPlay-specific.
        </p>
        <h3>ABR algorithms</h3>
        <ul>
          <li><strong>Throughput-based</strong> — measure recent download speed, pick the highest bitrate that fits with a safety margin. Easy, but oscillates on bursty connections.</li>
          <li><strong>Buffer-based (BOLA)</strong> — pick the bitrate that maximises a utility function of (current buffer length, requested bitrate). Smoother under stress.</li>
          <li><strong>Model-predictive (MPC / Pensieve)</strong> — predict throughput trajectory and run an optimisation. Best quality but harder to debug.</li>
        </ul>
        <p>
          hls.js uses a hybrid throughput + buffer-aware default. <code>config.abrEwmaDefaultEstimate</code> and friends let you tune.
        </p>
        <h3>Events to monitor</h3>
        <ul>
          <li><code>waiting</code> / <code>stalled</code> — player ran out of buffered data. Sum the time here = rebuffer time.</li>
          <li><code>timeupdate</code> — fires ~4x/sec, drives progress UI.</li>
          <li><code>error</code> — fatal player error. Codes 1-4 (aborted, network, decode, src not supported).</li>
          <li><code>levelSwitched</code> (hls.js) — ABR picked a new rendition.</li>
          <li><code>fragLoadError</code> (hls.js) — a segment fetch failed. Three in a row → fatal.</li>
        </ul>
        <h3>What this demo uses</h3>
        <p>
          hls.js in near-default config plus a custom <code>xhrSetup</code> that attaches the
          Bearer token to same-origin segment requests (so license.key + master.m3u8
          authenticate; ad-segment requests don't leak the token). Single-rendition manifest
          means no ABR switching to worry about. Player wraps a single{' '}
          <code>&lt;video&gt;</code> tag.
        </p>
      </>
    ),
  },
  {
    slug: 'live',
    title: 'Live streaming pipeline',
    blurb: 'Ingest protocols, sliding manifests, LL-HLS, the latency budget.',
    render: () => (
      <>
        <p>
          This demo is VOD only. Live is a parallel pipeline that shares the codec and DRM
          layers but differs everywhere else — the encoder is feeding fresh frames, the
          manifest is a sliding window, ad breaks come from SCTE-35 cues inside the live stream,
          and every latency budget is brutal.
        </p>
        <h3>Ingest protocols</h3>
        <table className="docs-gaps">
          <thead><tr><th>Protocol</th><th>Where it's used</th></tr></thead>
          <tbody>
            <tr><td>RTMP (1990s, Adobe)</td><td>The dominant push protocol despite Flash being dead. OBS, Wirecast and most live encoders speak it natively. TCP-based, no FEC, ~3-5s contribution latency.</td></tr>
            <tr><td>SRT</td><td>Secure Reliable Transport. UDP-based with ARQ. ~1-2s latency, encrypted by default. Common between contribution encoders and cloud ingest.</td></tr>
            <tr><td>RIST</td><td>Reliable Internet Stream Transport. Open standard alternative to SRT, similar properties.</td></tr>
            <tr><td>WHIP (WebRTC)</td><td>Browser-friendly. Sub-second latency, but designed for one-to-one. Used in pro-am contribution paths (interactive auctions, betting).</td></tr>
            <tr><td>Zixi</td><td>Proprietary commercial protocol. Common in broadcaster-to-broadcaster contribution links.</td></tr>
            <tr><td>HLS / DASH push</td><td>The encoder packages locally and HTTP-PUTs to origin. Higher latency, simpler ops.</td></tr>
          </tbody>
        </table>
        <h3>Manifest sliding window</h3>
        <p>
          A live media playlist is a window of the most recent N segments. Each playlist
          refresh drops the oldest segment, adds the newest. The player polls at half the
          target duration. There's no <code>#EXT-X-ENDLIST</code> until the broadcast ends.
        </p>
        <p>
          The <strong>DVR window</strong> is a longer retention tail — keep e.g. 4 hours of
          segments so a viewer can pause / seek back. Time-shift, start-over and
          restart-from-the-top all key off the DVR window length.
        </p>
        <h3>LL-HLS (Low-Latency HLS)</h3>
        <p>
          Classic HLS latency is 10-30s glass-to-glass because the player needs to wait for
          whole segments. LL-HLS adds:
        </p>
        <ul>
          <li><strong>Partial segments.</strong> The encoder publishes 250 ms partials of an in-progress segment.</li>
          <li><strong>Blocking playlist reload.</strong> Player asks for "playlist with segment N + part M"; server holds the request until that part exists.</li>
          <li><strong>HTTP/2 push.</strong> Server pushes the next partial alongside the playlist response.</li>
        </ul>
        <p>
          Drops latency to ~2-3 s, comparable to LL-DASH.
        </p>
        <h3>Latency budget</h3>
        <p>
          Glass-to-glass latency — from the encoder's camera to the viewer's screen — is the sum
          of every step in the chain. Three reference points:
        </p>
        <div className="docs-figure">
          <LiveLatencyFigure />
        </div>
        <ul>
          <li><strong>Classic HLS, 9–23 s.</strong> Encoder GOP (2-4 s) + contribution (1-2 s) + packaging (0-1 s) + CDN propagation (0-1 s) + player buffer for safe ABR (6-15 s).</li>
          <li><strong>LL-HLS, 2–3 s.</strong> Partial segments + blocking playlist reload + HTTP/2 push cut the buffer drastically.</li>
          <li><strong>WebRTC, ~500 ms.</strong> UDP-based, no segment-level abstraction. The cost is no MSE / EME ecosystem and minimal ABR sophistication.</li>
        </ul>
        <h3>Live SSAI</h3>
        <p>
          SCTE-35 markers inside the contribution feed flag "ad break in 5 seconds, 90 seconds
          long". The packager surfaces these as EXT-X-DATERANGE in the manifest; the live SSAI
          server intercepts and stitches a per-viewer ad pod in. Same shape as VOD SSAI but
          running in real time on a 60-second budget.
        </p>
      </>
    ),
  },
  {
    slug: 'observability',
    title: 'Observability & QoE',
    blurb: "How to know whether your viewers are happy — and which tweak made it better.",
    render: () => (
      <>
        <p>
          Streaming quality is the product. <strong>QoE</strong> (Quality of Experience) is the
          composite metric every encoding, packaging, CDN and player change is judged on.
          Operators monitor it in real time and slice it by every dimension that could explain
          regressions.
        </p>
        <h3>Core metrics</h3>
        <table className="docs-gaps">
          <thead><tr><th>Metric</th><th>Definition</th></tr></thead>
          <tbody>
            <tr><td>Startup time</td><td>From "play tapped" to "first frame on screen". Target: &lt; 2 s.</td></tr>
            <tr><td>Video Start Failure (VSF)</td><td>% of play attempts that never produced a first frame. Target: &lt; 1%.</td></tr>
            <tr><td>Exit Before Video Start (EBVS)</td><td>User gave up before VSF determined. Bundled with startup time tuning.</td></tr>
            <tr><td>Rebuffer ratio</td><td>Time stalled during play / total play time. Target: &lt; 0.5%.</td></tr>
            <tr><td>Average bitrate</td><td>Mean rendition selected. Higher = nicer picture, lower = less data risk.</td></tr>
            <tr><td>Bitrate switches / min</td><td>How often ABR oscillates. High = unstable connection or bad ABR algo.</td></tr>
            <tr><td>Video Playback Failure (VPF)</td><td>Started but errored mid-stream.</td></tr>
            <tr><td>Concurrent viewers</td><td>Capacity-planning input. Real-time + historical for autoscaling.</td></tr>
          </tbody>
        </table>
        <h3>Vendors</h3>
        <ul>
          <li><strong>Conviva</strong> — analytics + real-time multi-CDN switching. Industry de-facto.</li>
          <li><strong>Mux Data</strong> — modern API-first. Pairs with Mux Video JIT packaging.</li>
          <li><strong>Bitmovin Analytics</strong> — bundled with Bitmovin player.</li>
          <li><strong>NPAW (YOUBORA)</strong> — broadcaster favourite, European stronghold.</li>
          <li><strong>Datazoom</strong> — collector layer; pipes events to any backend.</li>
        </ul>
        <h3>How instrumentation flows</h3>
        <p>
          Player-side: hook into the events from the previous chapter, fire telemetry via XHR
          or sendBeacon. Batch and gzip locally. Vendor SDKs handle this for you. Server-side:
          {' '}<strong>CMCD</strong> (CTA-5004) attaches session-level telemetry to every
          segment request as HTTP headers, so the CDN log and the player log share a session
          ID and can be joined.
        </p>
        <h3>Dimensions that matter</h3>
        <p>
          Roll up metrics by CDN, ISP, geo, device family, OS, app version, content type,
          title, encoding profile. A 10% rebuffer ratio overall might be 0.2% in NA-cellular
          and 65% in APAC-CDN-X — averages hide localised fires.
        </p>
        <h3>Alerting</h3>
        <p>
          Static thresholds (rebuffer &gt; 5%, VSF &gt; 3%) catch crashes. Anomaly detection
          per dimension catches degradation — e.g., a CDN PoP that started rebuffering 3x
          normal in Tokyo at 9pm.
        </p>
      </>
    ),
  },
  {
    slug: 'cost',
    title: 'Cost model',
    blurb: 'Where the dollars go: CDN egress, encoding, storage, DRM, content acquisition.',
    render: () => (
      <>
        <p>
          OTT P&amp;L is dominated by a few line items that scale linearly with viewer hours.
          Understanding the breakdown is what turns "should we do AV1?" from a tech question
          into a financial one.
        </p>
        <h3>The big four (2026 order of magnitude)</h3>
        <table className="docs-gaps">
          <thead><tr><th>Line</th><th>Cost range</th></tr></thead>
          <tbody>
            <tr><td>CDN egress</td><td>$0.005-0.085 / GB. Negotiated heavily at scale. By far the dominant variable cost.</td></tr>
            <tr><td>Encoding (cloud)</td><td>$0.015-0.075 / output minute (AWS MediaConvert, Mux). Per-rendition.</td></tr>
            <tr><td>Storage</td><td>$0.023 / GB-month S3 Standard, $0.0125 Infrequent Access, $0.004 Glacier. Catalog tier to IA after first 90 days.</td></tr>
            <tr><td>DRM license issuance</td><td>$0.0001-0.001 / license. Free for hobbyist scale; enterprise contracts at low fractions of a cent.</td></tr>
          </tbody>
        </table>
        <h3>Worked example</h3>
        <p>1 million viewer-hours of a 5 Mbps stream:</p>
        <ul>
          <li>Bits delivered: 5 Mbps × 3600 s × 1M ≈ 2.25 PB</li>
          <li>At $0.02/GB CDN: 2.25M GB × $0.02 = <strong>$45,000</strong></li>
          <li>At $0.005/GB (top-tier negotiated): <strong>$11,250</strong></li>
        </ul>
        <p>
          Per viewer-hour: ~4.5 cents at $0.02/GB. That's the cost a SVOD subscription must
          cover — and then content acquisition, marketing, payments, customer support, profit.
        </p>
        <h3>Hardware vs cloud encoding</h3>
        <p>
          Cloud encoding billed per minute is convenient but ~10× the marginal cost of a colo'd
          GPU. NVENC on a $300/mo NVIDIA L4 can encode ~8 simultaneous H.264 4K @ 60 FPS
          streams. Once you're transcoding more than ~100 hours/day you save by going on-prem
          or spot-instance GPU.
        </p>
        <h3>Non-linear costs</h3>
        <ul>
          <li><strong>Captioning</strong> — manual transcription: $1-5/min. ML transcription + human review: $0.20-1/min.</li>
          <li><strong>Audio description</strong> — narrated by voice actors: $3-10/min.</li>
          <li><strong>QC</strong> — automated tools $$, manual review $$$. Reject rate &gt; 50% on first studio submissions is normal.</li>
          <li><strong>Per-title encoding</strong> — Netflix-style analysis: extra $0.05-0.20 / output minute, saves 5-30% bitrate at equal quality.</li>
          <li><strong>Original mastering</strong> — the production cost. Tentpole movie: $100M+. Episodic series: $1-15M/episode. Dwarfs everything above.</li>
        </ul>
        <h3>Levers</h3>
        <ul>
          <li><strong>Cache hit rate.</strong> A 99% cache hit means the CDN charges the 99% rate; the 1% origin egress is your real cost.</li>
          <li><strong>Codec efficiency.</strong> AV1 vs H.264 saves ~30% bytes at equal quality → 30% off the egress bill at the cost of encode time.</li>
          <li><strong>ABR ladder depth.</strong> Each rendition multiplies storage + encoding cost. Drop the highest tier if your viewer mix is mostly mobile.</li>
        </ul>
      </>
    ),
  },
  {
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
  },
  {
    slug: 'standards',
    title: 'Standards & organisations',
    blurb: 'Who defines what — SMPTE, ISO/MPEG, IETF, W3C, CTA, IAB, AOMedia.',
    render: () => (
      <>
        <p>
          Video is a thicker stack of standards than almost any other software domain. Knowing
          who publishes what helps when an SDK release note name-drops a spec.
        </p>
        <table className="docs-gaps">
          <thead><tr><th>Body</th><th>What they publish</th></tr></thead>
          <tbody>
            <tr><td><strong>SMPTE</strong> — Society of Motion Picture and Television Engineers</td><td>Broadcast standards — color spaces, timecode, MXF, IMF (SMPTE 2067), ST 2110 (uncompressed IP). The Hollywood / studio side.</td></tr>
            <tr><td><strong>ISO/IEC MPEG</strong> — Moving Picture Experts Group</td><td>Video codecs (MPEG-2, H.264 / AVC, H.265 / HEVC, H.266 / VVC), MPEG-DASH, CMAF (ISO/IEC 23000-19), CENC (ISO/IEC 23001-7).</td></tr>
            <tr><td><strong>IETF</strong> — Internet Engineering Task Force</td><td>Transport protocols — HLS (RFC 8216, an Apple-authored draft adopted by IETF), HTTP/2 + 3, the WebRTC IETF side, SRT, RIST.</td></tr>
            <tr><td><strong>W3C</strong> — World Wide Web Consortium</td><td>Browser-side APIs — HTML5 video, Media Source Extensions, Encrypted Media Extensions, WebCodecs, schema.org / VideoObject.</td></tr>
            <tr><td><strong>CTA</strong> — Consumer Technology Association</td><td>CTA-5004 (CMCD), CTA-WAVE (cross-vendor streaming test suite), Connected TV certification.</td></tr>
            <tr><td><strong>IAB Tech Lab</strong></td><td>Ad-tech standards — VAST, VMAP, VPAID (legacy), OpenRTB, ads.txt, IFA (Identifier For Advertising). The ad ecosystem's standards body.</td></tr>
            <tr><td><strong>AOMedia</strong> — Alliance for Open Media</td><td>AV1, AV2 (in progress), royalty-free codec stewardship.</td></tr>
            <tr><td><strong>ATSC</strong> — Advanced Television Systems Committee</td><td>North American broadcast TV — ATSC 1.0 (digital terrestrial), ATSC 3.0 (NextGen TV, IP-based).</td></tr>
            <tr><td><strong>DVB</strong> — Digital Video Broadcasting</td><td>European broadcast standards — DVB-T / S / C / IPTV. The OTT-relevant pieces (DVB-DASH) overlap with MPEG-DASH.</td></tr>
            <tr><td><strong>CableLabs</strong></td><td>Cable / MSO standards — ADI 3.0 (video metadata exchange), DOCSIS (the cable modem standard), Reliable Broadcast Transport.</td></tr>
            <tr><td><strong>EBU</strong> — European Broadcasting Union</td><td>R128 (loudness), EBU-TT-D (captions), broadcast workflow standards.</td></tr>
            <tr><td><strong>MovieLabs</strong></td><td>Studio-driven security and metadata. ML Common Security Model, Enhanced Content Protection. Sets the bar for forensic watermarking.</td></tr>
            <tr><td><strong>Dolby Laboratories</strong></td><td>Proprietary but de-facto standards — AC-3, E-AC-3, Atmos, Dolby Vision. Licensed.</td></tr>
          </tbody>
        </table>
        <h3>How to read this</h3>
        <p>
          A spec like "Widevine modular DRM" lives at the intersection of W3C EME (browser
          API), ISO CENC (encryption format), and Google's proprietary CDM. "HLS with
          Widevine" pulls in IETF (HLS), W3C (EME), ISO (CENC) and CableLabs (encryption test
          vectors). Almost nothing in this stack lives inside a single organisation.
        </p>
      </>
    ),
  },
  {
    slug: 'compliance',
    title: 'Compliance & accessibility',
    blurb: 'WCAG, EAA, CVAA, age gates, loudness norms — what regulators require.',
    render: () => (
      <>
        <p>
          Operating a streaming service means complying with regulators in every market. The
          rules cluster into accessibility, age-appropriate content, loudness and data
          protection.
        </p>
        <h3>Accessibility regulation</h3>
        <table className="docs-gaps">
          <thead><tr><th>Region</th><th>Rule</th></tr></thead>
          <tbody>
            <tr><td>US — federal</td><td>21st Century Communications and Video Accessibility Act (CVAA, 2010) — requires captions, audio description, accessible player UI. Enforced by the FCC.</td></tr>
            <tr><td>US — federal contracts</td><td>Section 508 — IT used by federal agencies must meet WCAG 2.0 AA. Vendors comply to remain eligible.</td></tr>
            <tr><td>US — civil rights</td><td>ADA (Americans with Disabilities Act) — used in lawsuits against streaming UIs that aren't screen-reader compatible.</td></tr>
            <tr><td>EU</td><td>European Accessibility Act (EAA, mandatory June 2025) — covers audiovisual on-demand services. Penalty regime per member state.</td></tr>
            <tr><td>UK</td><td>Equality Act 2010; Ofcom Code requires statutory caption / AD / sign-language minimums.</td></tr>
            <tr><td>Canada</td><td>Accessible Canada Act + AODA (Ontario). Mandatory captions and AD percentages.</td></tr>
          </tbody>
        </table>
        <h3>WCAG 2.2 for video (AA-level checks)</h3>
        <ul>
          <li><strong>1.2.2 Captions (Prerecorded)</strong> — caption track required for all pre-recorded audio content.</li>
          <li><strong>1.2.3 Audio Description (Prerecorded)</strong> — audio description or full-text alternative.</li>
          <li><strong>1.2.5 Audio Description (AA)</strong> — audio description required, no text alternative substitute.</li>
          <li><strong>1.4.5 Images of text</strong> — caption track, not burned-in subtitles.</li>
          <li><strong>2.1 Keyboard</strong> — all player controls reachable without a pointer.</li>
          <li><strong>2.3.1 Three flashes</strong> — no content that flashes more than 3 times/sec (epilepsy trigger).</li>
          <li><strong>4.1.2 Name, Role, Value</strong> — screen reader can announce play / pause / seek state.</li>
        </ul>
        <h3>Captioning vs subtitles vs audio description</h3>
        <ul>
          <li><strong>Captions</strong> — for deaf or hard-of-hearing viewers. Include speaker IDs, sound effects, music descriptions.</li>
          <li><strong>Subtitles</strong> — for hearing viewers who don't speak the audio language. Dialogue only.</li>
          <li><strong>SDH (Subtitles for the Deaf and Hard-of-hearing)</strong> — combines both: target-language captions with HoH cues.</li>
          <li><strong>Audio description (AD)</strong> — narrated description of on-screen action between dialogue. Required by CVAA, EAA. Studios contract voice actors for this.</li>
        </ul>
        <h3>Ratings & age gates</h3>
        <p>
          Every region has a content ratings body whose codes must appear on the title page
          and gate playback for minors:
        </p>
        <ul>
          <li><strong>MPAA</strong> — US (G / PG / PG-13 / R / NC-17).</li>
          <li><strong>BBFC</strong> — UK (U / PG / 12 / 15 / 18).</li>
          <li><strong>FSK</strong> — Germany (0 / 6 / 12 / 16 / 18).</li>
          <li><strong>CSA</strong> — France (TP / -10 / -12 / -16 / -18).</li>
          <li><strong>GRAC</strong> — South Korea.</li>
          <li><strong>CERO</strong> — Japan.</li>
          <li><strong>NRTA</strong> — China (strict content review, not just rating).</li>
        </ul>
        <p>
          Profile-level parental controls enforce these per household. Some regions (DE, FR)
          have mandatory time-of-day curfews for higher-rated content even per profile.
        </p>
        <h3>Loudness compliance</h3>
        <ul>
          <li><strong>US — CALM Act / ATSC A/85</strong> — -24 LKFS ±2 dB. FCC enforces.</li>
          <li><strong>EU — EBU R128</strong> — -23 LUFS ±1 dB. Required across DVB and most VOD.</li>
          <li><strong>Streaming (non-regulated, de-facto)</strong> — -16 LUFS (Spotify, Apple), -14 LUFS (YouTube).</li>
        </ul>
        <h3>Data protection</h3>
        <p>
          Viewing data is personal data. GDPR (EU), CCPA (California) and similar regional
          rules require explicit consent for non-essential telemetry, the right to download
          history, and the right to delete.
        </p>
      </>
    ),
  },
  {
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
  },
  {
    slug: 'glossary',
    title: 'Glossary',
    blurb: 'Every OTT term used in this codebase, grouped by topic.',
    render: () => <Glossary />,
  },
  {
    slug: 'captions',
    title: 'Captions & subtitles workflow',
    blurb: 'WebVTT, TTML, sidecar vs in-band, and the auto-transcribe + translate fan-out pipeline.',
    render: () => (
      <>
        <p>
          Compliance covered the regulatory side. This chapter covers the engineering side. The
          caption / subtitle layer of an OTT catalog is a parallel pipeline that runs alongside
          the video pipeline — format choice, authoring tool, language fan-out, QC, packaging,
          delivery — and it costs roughly as much per program as transcoding.
        </p>

        <h3>Format families</h3>
        <table className="docs-gaps">
          <thead><tr><th>Format</th><th>Where it lives</th></tr></thead>
          <tbody>
            <tr>
              <td>WebVTT (.vtt)</td>
              <td>Browser-native. The format HLS prefers. Plain text with cue timestamps, optional styling, voice tags. What every modern web player consumes.</td>
            </tr>
            <tr>
              <td>SRT (.srt)</td>
              <td>Simple legacy text. Universal in non-streaming workflows. Not playable in HLS or browsers directly — transcoded to WebVTT at packaging time.</td>
            </tr>
            <tr>
              <td>TTML / EBU-TT-D / IMSC1</td>
              <td>W3C XML caption format with rich styling, positioning, animation. Studios author master subtitles in IMSC1 (the modern profile); European broadcasters use EBU-TT-D. Carried over HLS via <code>EXT-X-MEDIA TYPE=SUBTITLES</code>.</td>
            </tr>
            <tr>
              <td>CEA-608 / CEA-708</td>
              <td>Captions encoded inside the video bitstream itself. The legacy broadcast standard. Modern OTT prefers sidecar but FAST channels often still carry 608.</td>
            </tr>
          </tbody>
        </table>

        <h3>Minimal WebVTT</h3>
        <pre><code>{`WEBVTT

00:00:00.000 --> 00:00:04.500
<v Narrator>The story begins with a small town
on the edge of nowhere.

00:00:04.500 --> 00:00:08.200 line:0 position:50%
[wind howling]

STYLE
::cue { background: rgba(0,0,0,0.8); color: white; }`}</code></pre>

        <h3>HLS wiring</h3>
        <p>
          Each language gets its own media playlist; the master playlist groups them under{' '}
          <code>SUBTITLES="subs"</code> and the variant streams reference that group:
        </p>
        <pre><code>{`# master.m3u8
#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="subs",NAME="English",
    DEFAULT=YES,AUTOSELECT=YES,LANGUAGE="en",URI="subs/en.m3u8"
#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="subs",NAME="Español",
    LANGUAGE="es",URI="subs/es.m3u8"
#EXT-X-STREAM-INF:BANDWIDTH=2400000,CODECS="avc1.64001f,mp4a.40.2",
    AUDIO="aac",SUBTITLES="subs"
720p/index.m3u8

# subs/en.m3u8 (media playlist for subtitle segments)
#EXTM3U
#EXT-X-VERSION:6
#EXT-X-TARGETDURATION:240
#EXTINF:240.0,
en_0.vtt
#EXT-X-ENDLIST`}</code></pre>

        <h3>DASH wiring</h3>
        <p>
          DASH expresses subtitles as an <code>AdaptationSet</code> with{' '}
          <code>contentType="text"</code> and either inline TTML or a <code>SegmentTemplate</code>
          {' '}pointing at WebVTT / IMSC1 chunks. Same SUBTITLES group concept, XML instead of
          playlist text.
        </p>

        <h3>Authoring & translation workflow</h3>
        <ol>
          <li><strong>Transcribe</strong> source-language audio. Auto (Whisper, Deepgram, AssemblyAI, Rev Reverb) costs ~$0.20-1.00 / minute and hits 92-97% word accuracy. Human transcription costs $1-5 / minute and hits 99%.</li>
          <li><strong>Align + clean.</strong> Force-align cues against the audio, split into reading-rate-compliant lines (max ~17 chars/sec, max 2 lines, max ~36 chars/line), add speaker IDs and sound effects for HoH captions.</li>
          <li><strong>Translate.</strong> Fan-out per language: machine translation (DeepL, NMT models) is ~85% acceptable for streaming; tentpole content goes through human post-edit.</li>
          <li><strong>Vendor review.</strong> Studios contract specialists — Iyuno, IYUNO-SDI, ZOO Digital, Pixelogic — for human QC.</li>
          <li><strong>Package.</strong> Transcode master into WebVTT, segment for HLS, write the SUBTITLES group lines into the master playlist.</li>
        </ol>

        <h3>Captions vs subtitles vs SDH</h3>
        <ul>
          <li><strong>Captions</strong> — for deaf / HoH viewers. Include speaker IDs, sound effects, music descriptions.</li>
          <li><strong>Subtitles</strong> — translation aid for hearing viewers. Dialogue only.</li>
          <li><strong>SDH</strong> (Subtitles for the Deaf and Hard-of-hearing) — translation + HoH cues. Used when there's no captions track in the source language.</li>
        </ul>

        <h3>Sync challenges</h3>
        <p>
          Captions must align with audio sample-accurately. Common breakages: drift from a
          non-zero-start media offset (PROGRAM-DATE-TIME mismatch), segment-boundary cue splits
          that lose the second half, framerate-induced timecode rounding (24p vs 23.976 NTSC).
          Production runs a sync-validation pass before publishing.
        </p>
      </>
    ),
  },
  {
    slug: 'trick-play',
    title: 'Trick-play & thumbnails',
    blurb: 'Scrubbing previews, I-frame fast-forward, seek snapping — what lives behind the progress bar.',
    render: () => (
      <>
        <p>
          When a viewer hovers the progress bar and a small thumbnail appears, or holds
          fast-forward and the picture zips through at 8× speed, that's <strong>trick-play
          </strong>. Three separate features live under the name: scrubbing preview thumbnails,
          I-frame fast-forward, and seek snapping.
        </p>

        <h3>Scrubbing preview thumbnails</h3>
        <p>
          The player needs an image for every N seconds of the timeline. Two main delivery
          formats:
        </p>
        <table className="docs-gaps">
          <thead><tr><th>Format</th><th>What it is</th></tr></thead>
          <tbody>
            <tr>
              <td>WebVTT thumbnail manifest</td>
              <td>Standard <code>.vtt</code> file where each cue points at an image — either a URL per thumbnail or a sprite-sheet URL with a <code>#xywh</code> fragment.</td>
            </tr>
            <tr>
              <td>BIF (Roku Base Index File)</td>
              <td>Roku's binary thumbnail container — JPEGs + an index. Common across Roku-derived platforms (Roku Channel, Roku-based smart TVs). One file per asset.</td>
            </tr>
          </tbody>
        </table>
        <pre><code>{`# thumbnails.vtt — sprite-sheet form
WEBVTT

00:00:00.000 --> 00:00:10.000
sprite.jpg#xywh=0,0,160,90

00:00:10.000 --> 00:00:20.000
sprite.jpg#xywh=160,0,160,90

00:00:20.000 --> 00:00:30.000
sprite.jpg#xywh=320,0,160,90`}</code></pre>
        <p>
          Production typical: one 160×90 thumbnail every 5-10 s of program, packed into 10×10
          sprite sheets (so each sheet covers 5-10 minutes of program). Generated at packaging
          time with FFmpeg's <code>thumbnail</code> filter and <code>montage</code>.
        </p>

        <h3>I-frame fast-forward</h3>
        <p>
          Playing the full bitstream at 2× / 4× / 8× speed is decoder-heavy and not how player
          UIs actually do fast-forward. Instead, HLS publishes a separate I-frame-only playlist
          — the same timeline but containing only the I-frames (one frame every ~2 s):
        </p>
        <div className="docs-figure">
          <TrickPlayFigure />
        </div>
        <pre><code>{`# master.m3u8
#EXT-X-I-FRAME-STREAM-INF:BANDWIDTH=200000,RESOLUTION=1280x720,
    CODECS="avc1.64001f",URI="720p/iframes.m3u8"

# 720p/iframes.m3u8 — only I-frame byte ranges
#EXTM3U
#EXT-X-VERSION:4
#EXT-X-TARGETDURATION:2
#EXTINF:2.000,
#EXT-X-BYTERANGE:48000@0
segment_000.ts
#EXTINF:2.000,
#EXT-X-BYTERANGE:51200@2000000
segment_001.ts`}</code></pre>
        <p>
          At fast-forward the player switches to the I-frame playlist, pulls just the keyframe
          chunks, shows them at the requested speed — same visual effect, fraction of the
          bandwidth and CPU.
        </p>

        <h3>DASH trickmode</h3>
        <p>
          DASH expresses the same idea with a separate AdaptationSet marked as trickmode:
        </p>
        <pre><code>{`<AdaptationSet contentType="video">
  <EssentialProperty
    schemeIdUri="http://dashif.org/guidelines/trickmode"
    value="1" />
  <Representation id="iframes" bandwidth="200000" codecs="avc1.64001f"
    ... />
</AdaptationSet>`}</code></pre>

        <h3>Seek snapping & PROGRAM-DATE-TIME anchors</h3>
        <p>
          Live content uses <code>#EXT-X-PROGRAM-DATE-TIME</code> to anchor each segment to
          wall-clock. The player's seek bar reads in wall-clock terms and snaps to segment
          boundaries during DVR seek. Same anchor lets a "skip intro" or "start over" button
          compute a frame-accurate seek.
        </p>

        <h3>Cost</h3>
        <p>
          Thumbnail strips: ~1 MB per hour of program for 160×90 @ 5 s spacing in JPEG. I-frame
          ladder: ~10% extra encode time per rendition (the I-frames already exist; you're
          just emitting an additional playlist + byte-range index). Most production transcoders
          emit both as part of the packaging step.
        </p>
      </>
    ),
  },
  {
    slug: 'identity',
    title: 'Identity, profiles & devices',
    blurb: 'Account vs profile model, device registration, MVPD federation, OAuth providers.',
    render: () => (
      <>
        <p>
          Auth covered "is this JWT valid". This chapter covers the layer above — the data model
          that lets one household share an account, the system that tracks which devices a
          subscription has signed in on, and the federation paths real OTT uses for sign-in.
        </p>
        <div className="docs-figure">
          <AccountProfilesDevicesFigure />
        </div>

        <h3>Account vs profile</h3>
        <p>
          One <strong>account</strong> = one billing relationship, one entitlement, one set of
          household-level settings (region, language, payment method). Inside it, the user
          creates <strong>profiles</strong> — each with its own watch history, queue, maturity
          rating, recommendations, language preference. Netflix popularised the 5-profile cap;
          most platforms followed.
        </p>
        <ul>
          <li><strong>Adult profile</strong> — full catalog at the account's maturity tier.</li>
          <li><strong>Kid profile</strong> — content filtered to a kid rating (PG-13 etc.). No targeted ads (COPPA). Often forces SDH captions on.</li>
          <li><strong>Restricted profile</strong> — PIN-locked, age-gated. Optional.</li>
        </ul>

        <h3>Device registration</h3>
        <p>
          A device is whatever runs the player — a phone, a TV app, a console. The platform
          tracks <strong>registered devices</strong> (max ~10) and <strong>concurrent streams
          </strong> (max 4 for Premium tier, 2 for Standard, 1 for Basic). The concurrency
          check fires at <em>license-issue time</em> — not at app start — so signing in on a
          new device doesn't sign anyone out until they hit Play.
        </p>
        <p>
          Sign-out-everywhere is a single button in account settings. Under the hood it bumps
          a per-account <code>token_version</code> (same pattern this demo uses) so all
          previously-issued access tokens fail their next refresh.
        </p>

        <h3>MVPD / TV Everywhere federation</h3>
        <p>
          In the US, premium cable channels (HBO via Comcast, ESPN via DirecTV) authenticate via
          {' '}<strong>TVE</strong> (TV Everywhere) using <strong>Adobe Pass</strong> /
          <strong>Comcast SSO</strong>. The viewer enters their cable provider; the OTT app
          redirects to the MVPD's auth flow; on success the MVPD returns an entitlement token
          asserting "this household has the channel subscribed". The OTT app issues a session
          based on that — no separate username / password.
        </p>

        <h3>OAuth providers</h3>
        <p>
          Apple Sign In, Google Sign In, Facebook Login. Each issues an OIDC ID token; your
          backend verifies the signature, extracts an external user ID, looks up or creates an
          internal account. Apple Sign In has the relay-email caveat: the email is opaque
          unless the user opts to share, so you need a stable subject ID for account linking.
        </p>

        <h3>Magic links & passkeys</h3>
        <ul>
          <li><strong>Magic link</strong> — email or SMS containing a one-time-use signed URL. Bypasses passwords entirely. Common for CTV apps where typing a password on a remote is painful.</li>
          <li><strong>Passkeys (WebAuthn)</strong> — public-key auth tied to the device's secure enclave. Phishing-resistant, but CTV support is patchy.</li>
        </ul>

        <h3>Account recovery</h3>
        <p>
          Password reset via email is table stakes. Production also handles: lost device
          (revoke that device's registration), forgotten email (CS-mediated via billing
          provider), account takeover detection (sudden geography change, mass password resets
          → freeze account, force email confirmation).
        </p>
      </>
    ),
  },
  {
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
  },
  {
    slug: 'payments',
    title: 'Payments & billing',
    blurb: "Subscription lifecycle, App Store IAP, family plans, cross-platform entitlement.",
    render: () => (
      <>
        <p>
          OTT revenue maps onto a small state machine of subscriptions and a fan-out of
          purchase paths (web checkout, App Store IAP, Play Store IAP, third-party MVPD
          bundles). Engineering work is mostly: model the states correctly, reconcile across
          purchase paths, never let entitlement drift from the source of truth.
        </p>

        <h3>Subscription state machine</h3>
        <div className="docs-figure">
          <SubscriptionStateMachineFigure />
        </div>
        <ul>
          <li><strong>TRIAL → ACTIVE.</strong> Trial end + first charge succeeds.</li>
          <li><strong>ACTIVE → PAST_DUE.</strong> Recurring charge fails (declined card, expired card, insufficient funds).</li>
          <li><strong>PAST_DUE → ACTIVE.</strong> Smart retry (Stripe Adaptive Acceptance, Adyen Risk Engine) recovers the charge within ~3-7 days.</li>
          <li><strong>PAST_DUE → DUNNING.</strong> Retry budget exhausted. Now in an explicit grace period (typically 7 days) during which the viewer can still play but receives in-app reminders.</li>
          <li><strong>DUNNING → CANCELED.</strong> Grace expires without payment. Access cut at the next license-issue check.</li>
          <li><strong>CANCELED → ACTIVE.</strong> Re-subscribe.</li>
        </ul>

        <h3>App Store / Play Store IAP</h3>
        <p>
          Apple and Google require their billing for any digital subscription consumed inside
          their respective apps — and take a 15-30% cut. Engineering reality:
        </p>
        <ul>
          <li><strong>Receipt validation.</strong> Both stores issue signed receipts. Back-end validates with Apple / Google's verification endpoint, never trusts the client.</li>
          <li><strong>Server-to-server notifications.</strong> Renewal events, refunds, grace-period transitions arrive as webhooks (Apple App Store Server Notifications, Google Real-Time Developer Notifications).</li>
          <li><strong>No outbound link to web checkout.</strong> Apple's anti-steering rules forbid the app from linking out to your web payment page — though the 2024 Epic Games settlement carved out exceptions in some regions.</li>
          <li><strong>Web-purchased subscriptions still work in the iOS app.</strong> The viewer can sign up on your website, then sign in on iOS and watch. Their entitlement just doesn't flow through Apple IAP.</li>
        </ul>

        <h3>Family plans</h3>
        <p>
          Disney+ Premier Access, Netflix Standard with extra members, Apple One Family. One
          billing account, multiple <em>secondary members</em>, each with their own login and
          profile but sharing the entitlement. Implementation: a one-to-many{' '}
          <code>account → linked_users</code> table with per-member limits.
        </p>

        <h3>Regional pricing & taxation</h3>
        <ul>
          <li><strong>Regional pricing.</strong> Netflix charges $7.99 in the US and ₹149 in India. PPP-adjusted, market-positioned.</li>
          <li><strong>Tax.</strong> VAT in the EU, GST in India, sales tax in some US states. Calculated by Stripe Tax / Vertex / Avalara at checkout time.</li>
          <li><strong>Currency.</strong> Charge in local currency; settle in USD or another reporting currency. FX rates locked at charge time.</li>
        </ul>

        <h3>Entitlement service</h3>
        <p>
          The single source of truth for "can this viewer play this content right now". Sits
          in front of the license endpoint. Inputs: account ID, profile ID, asset rights
          (window, region), device, payment status, concurrent stream count. Output: yes / no
          / yes-with-degradation (e.g., SD-only on a non-HDCP device).
        </p>
        <p>
          Production OTT runs the entitlement service in a tier-0 SLO: it's on the play path.
          If it goes down, no one watches anything. Common pattern: read replicas + aggressive
          edge caching keyed on (account, asset).
        </p>

        <h3>Chargebacks & refunds</h3>
        <p>
          Credit-card chargebacks arrive 60-120 days after the charge. The platform owes the
          processor the chargeback fee (~$15) and forfeits the original revenue. High
          chargeback rates (&gt;1%) get the merchant account flagged. Engineering work: fraud
          scoring at sign-up, address verification (AVS), 3-D Secure, and rapid refunds for
          accidental subscriptions before they hit dispute.
        </p>
      </>
    ),
  },
  {
    slug: 'privacy',
    title: 'Privacy & consent',
    blurb: 'TCF v2, IFA / IDFA / GAID, ATT, COPPA — the engineering side of data protection.',
    render: () => (
      <>
        <p>
          Compliance named the regulators (GDPR, CCPA, EAA, CVAA). This chapter names the
          engineering primitives that implement compliance: consent strings, advertising IDs,
          platform tracking policies, kids-content carve-outs. Production OTT keeps a privacy
          team adjacent to the platform team because every new feature that touches user data
          gets reviewed against these rules.
        </p>
        <div className="docs-figure">
          <ConsentFlowFigure />
        </div>

        <h3>IAB TCF v2.2 consent string</h3>
        <p>
          The industry-standard wire format for a viewer's consent choices. A short
          base64-encoded string that encodes:
        </p>
        <ul>
          <li><strong>Purposes</strong> — 10 enumerated data-processing purposes (storage, personalisation, ad measurement, analytics, etc.). Per-purpose <code>YES</code> / <code>NO</code>.</li>
          <li><strong>Vendors</strong> — which of the ~1,000 registered ad-tech vendors the user has consented to.</li>
          <li><strong>Special features</strong> — geolocation, device scan.</li>
          <li><strong>Legitimate interest</strong> overrides where the vendor processes under that legal basis instead of consent.</li>
        </ul>
        <p>
          Every downstream consumer (ad server, analytics, recommendation pipeline) reads the
          TCF string before processing. If the relevant purposes aren't consented, the data
          path short-circuits. CMP vendors: <strong>OneTrust</strong>,{' '}
          <strong>Sourcepoint</strong>, <strong>Didomi</strong>, <strong>TrustArc</strong>.
        </p>

        <h3>Advertising identifiers</h3>
        <table className="docs-gaps">
          <thead><tr><th>Identifier</th><th>Platform</th></tr></thead>
          <tbody>
            <tr><td>IDFA</td><td>iOS — opt-in via App Tracking Transparency (ATT) since iOS 14.5. Default OFF; opt-in rate is ~25% globally.</td></tr>
            <tr><td>GAID / AAID</td><td>Android — opt-out. Google announced full deprecation by 2026, replaced by Privacy Sandbox on Android.</td></tr>
            <tr><td>Roku ID for Advertising (RIDA)</td><td>Roku — per-device, resettable.</td></tr>
            <tr><td>Tizen TIFA / LG LGUDID</td><td>Smart-TV vendor-specific.</td></tr>
            <tr><td>OTT identifier</td><td>Industry effort — a hashed-email-based or first-party device ID that survives platform opt-outs. UID2 / RampID / ID5.</td></tr>
          </tbody>
        </table>

        <h3>iOS App Tracking Transparency (ATT)</h3>
        <p>
          Since iOS 14.5, any app that tracks the user across apps / sites must show a system
          prompt asking permission. Decline → IDFA returns as zeros, retargeting paths
          deactivate. The OTT impact: ad CPMs on iOS dropped 30-50% after ATT; targeted
          recommendations using ad-tech vendors went dark for 75% of iOS users.
        </p>

        <h3>COPPA — kids content</h3>
        <p>
          US COPPA (Children's Online Privacy Protection Act): no behavioural tracking on
          under-13 content. Engineering carve-outs:
        </p>
        <ul>
          <li>Kid profiles get no IFA, no behavioural analytics, no targeted ads.</li>
          <li>Content classified as kids-directed sets a "kids" flag on the manifest, which the ad server uses to serve only contextual ads.</li>
          <li>Verifiable parental consent (VPC) gate for any data collection beyond minimum operational.</li>
        </ul>

        <h3>Data Subject Access Requests (DSAR)</h3>
        <p>
          GDPR Article 15 (access) and 17 (erasure). Implementation: a self-service portal +
          a backend pipeline that snapshots every system the user's data lives in (account
          DB, viewing history, recommendation embeddings, ad-tracking, support tickets),
          packages a JSON / CSV export, and on deletion request, purges or anonymises across
          all of them within 30 days. Tools: <strong>OneTrust</strong>,{' '}
          <strong>Transcend</strong>, <strong>DataGrail</strong> automate the fan-out.
        </p>

        <h3>Cookieless tracking landscape</h3>
        <p>
          Third-party cookies are being phased out on Chrome (Privacy Sandbox) and already gone
          on Safari + Firefox. OTT's response: <strong>first-party identifiers</strong>{' '}
          (the platform's own signed-in user ID, used cross-device with proper consent),
          {' '}<strong>data clean rooms</strong> (Snowflake, InfoSum, Habu — let two parties
          intersect their audiences without exchanging raw data), and{' '}
          <strong>contextual targeting</strong> (target by content category instead of by
          viewer identity).
        </p>
      </>
    ),
  },
  {
    slug: 'devices',
    title: 'Device platforms & SDKs',
    blurb: 'Where the OTT app actually ships — web, mobile, CTV, console.',
    render: () => (
      <>
        <p>
          The backend is one stack; the clients are many. Each device family has its own SDK,
          its own player constraints, its own UX patterns, and its own store / certification
          process. Production OTT typically maintains 8-12 client codebases simultaneously.
        </p>
        <div className="docs-figure">
          <DevicePlatformsFigure />
        </div>

        <h3>Web</h3>
        <p>
          Single codebase, runs everywhere a modern browser does. Uses hls.js / shaka-player
          + EME with Widevine on Chrome / Firefox / Edge and FairPlay on Safari. Easiest to
          ship, frequent updates, no store gatekeeper.
        </p>

        <h3>Mobile</h3>
        <ul>
          <li><strong>iOS / iPadOS / tvOS</strong> — native Swift with AVPlayer + FairPlay. App Store submission, 15-30% revenue cut, weekly review timeline.</li>
          <li><strong>Android</strong> — native Kotlin or Java with ExoPlayer (now Media3) + Widevine. Play Store similar economics, faster review.</li>
          <li><strong>Cross-platform</strong> — React Native + react-native-video, Flutter + video_player. Trades some native quality for one codebase.</li>
        </ul>

        <h3>CTV — Connected TV</h3>
        <p>
          The hardest tier. Each smart-TV vendor has their own SDK, OS, performance ceiling
          and store. UX is "10-foot UI" — large fonts, big focus rings, D-pad navigation
          (no touch).
        </p>
        <table className="docs-gaps">
          <thead><tr><th>Platform</th><th>What it takes</th></tr></thead>
          <tbody>
            <tr><td>Apple TV (tvOS)</td><td>Swift with AVPlayer + FairPlay. Best dev ergonomics of the CTV family.</td></tr>
            <tr><td>Roku</td><td>BrightScript + SceneGraph. Proprietary language, unique ecosystem. Massive US install base (~70M devices). Roku-specific player APIs (PlayReady DRM with custom interfaces).</td></tr>
            <tr><td>Fire TV / Android TV / Google TV</td><td>Android SDK with Leanback library. ExoPlayer + Widevine. Largest CTV install base globally.</td></tr>
            <tr><td>Samsung Tizen</td><td>JavaScript + Web APIs + Samsung Smart TV Studio. PlayReady DRM. SDK quirks, slow review.</td></tr>
            <tr><td>LG webOS</td><td>JavaScript + webOS SDK. PlayReady DRM. Similar workflow to Tizen.</td></tr>
            <tr><td>Chromecast / Google Cast</td><td>Receiver app (HTML5 + Cast SDK) + sender SDKs on iOS / Android / web. Different UX paradigm: phone is the remote, TV is just display.</td></tr>
            <tr><td>Vizio SmartCast / Hisense VIDAA</td><td>Smaller stores, regional. Often outsourced or built on a partner SDK.</td></tr>
          </tbody>
        </table>

        <h3>Console</h3>
        <ul>
          <li><strong>PlayStation</strong> — Sony's proprietary SDK. Custom player layer + PlayReady DRM. Cert process is rigorous (weeks).</li>
          <li><strong>Xbox</strong> — UWP (Universal Windows Platform) or Microsoft Store native app. PlayReady DRM (Microsoft's). Easier than PlayStation but still cert-gated.</li>
        </ul>

        <h3>Code sharing strategies</h3>
        <p>
          Three practical patterns:
        </p>
        <ul>
          <li><strong>Native per platform.</strong> Best player quality, highest engineering cost. Tier-1 OTT (Netflix, Disney+) does this.</li>
          <li><strong>React Native or Flutter for mobile + native CTV.</strong> Compromise — share business logic across iOS/Android, native for everything else.</li>
          <li><strong>Web-everywhere.</strong> Build a web app, wrap it for CTV (Tizen / webOS / Roku BrightScript-bridged web view). Lowest cost, lowest quality. Smaller streamers + FAST channels.</li>
        </ul>

        <h3>What's shared regardless</h3>
        <p>
          The backend (catalog API, license endpoint, entitlement service, recommendations),
          the media itself (HLS / DASH / CMAF manifests + segments), the consent string, the
          entitlement model. The clients differ; everything north of the network is one
          implementation.
        </p>
      </>
    ),
  },
  {
    slug: 'multi-drm',
    title: 'Multi-DRM in production',
    blurb: 'Wiring Widevine + FairPlay + PlayReady through a DRM-as-a-Service vendor.',
    render: () => (
      <>
        <p>
          The DRM chapter named the three commercial CDMs. This chapter walks how an engineer
          actually wires them in — because nobody implements all three from scratch.
          Production OTT uses one of two paths: build a full license server in-house (Netflix,
          Disney+) or contract a <strong>DRM-as-a-Service</strong> vendor (everyone else).
        </p>

        <h3>The encrypt-once model</h3>
        <p>
          The packager produces <strong>CENC</strong>-encrypted segments — one set of bytes
          consumable by all three CDMs. A few specifics:
        </p>
        <ul>
          <li><strong>One key ID + content key per asset</strong> — or one per quality tier (SD / HD / UHD usually have separate keys so a low-security CDM can hold the SD key without unlocking HD).</li>
          <li><strong>PSSH (Protection System Specific Header) boxes</strong> in the init segment — one per CDM, carrying CDM-specific key wrapping. Widevine, PlayReady, FairPlay each have their own PSSH UUID.</li>
          <li><strong>FairPlay caveat</strong> — historically Apple required SAMPLE-AES, not CENC's cenc / cbcs schemes. Modern FairPlay accepts <code>cbcs</code> CENC mode, which is what every multi-DRM packager emits today.</li>
        </ul>

        <h3>License request flow</h3>
        <div className="docs-figure">
          <EMELicenseSequenceFigure />
        </div>
        <ol>
          <li>Player encounters an encrypted segment, fires the EME <code>encrypted</code> event.</li>
          <li>Player requests a media key session from the CDM (Widevine / FairPlay / PlayReady).</li>
          <li>CDM produces a <strong>license request blob</strong> — opaque, CDM-specific.</li>
          <li>Player POSTs the blob to a <strong>license URL</strong> provided by your platform.</li>
          <li>License URL handler validates the viewer's entitlement (subscription, rights window, geo, concurrent stream, HDCP), then forwards the blob to the DRM vendor's license server.</li>
          <li>Vendor returns a <strong>license response blob</strong> — wraps the content key for that CDM.</li>
          <li>Player feeds the response back to the CDM via <code>session.update()</code>.</li>
          <li>CDM unwraps the key and starts decrypting segments inside its trusted environment.</li>
        </ol>

        <h3>DRM-as-a-Service vendors</h3>
        <table className="docs-gaps">
          <thead><tr><th>Vendor</th><th>What they offer</th></tr></thead>
          <tbody>
            <tr><td>PallyCon</td><td>Widevine + FairPlay + PlayReady + forensic watermarking. Mid-tier pricing. Popular for Korean / SEA streamers.</td></tr>
            <tr><td>EZDRM</td><td>One-stop multi-DRM. Mid-tier. US-headquartered, broad adoption.</td></tr>
            <tr><td>BuyDRM (KeyOS)</td><td>Multi-DRM + analytics. Enterprise pricing. Common at tier-1 studios.</td></tr>
            <tr><td>Axinom</td><td>Multi-DRM + a full OTT platform stack. European, strong in CTV.</td></tr>
            <tr><td>Verimatrix</td><td>Multi-DRM + cardless conditional access for IPTV.</td></tr>
          </tbody>
        </table>

        <h3>Where your code sits</h3>
        <p>
          The vendor runs the license servers; you run the <strong>entitlement endpoint</strong>
          in front of them. That endpoint is the only place your business rules live —
          subscription status, rights window, country, parental controls, concurrent stream.
          The call out to the vendor is essentially: "given this verified entitlement, mint a
          license for this CDM with these constraints (HDCP level, persistence, output
          protection)".
        </p>

        <h3>Persistent vs session licenses</h3>
        <ul>
          <li><strong>Session license</strong> — valid only while the playback session is live. Default for streaming.</li>
          <li><strong>Persistent license</strong> — stored on the device for offline playback. Has its own expiry. Required for "download for offline" features. Usually billed at a premium per issuance.</li>
        </ul>

        <h3>Key rotation</h3>
        <p>
          For long live streams (or 24/7 channels), the content key rotates periodically. The
          manifest emits a new <code>#EXT-X-KEY</code> entry, the player asks for a new license
          with the new key ID, the CDM gets the wrapped key, decryption continues seamlessly.
          Rotation cadence is usually hourly for live, never for VOD.
        </p>

        <h3>Cost</h3>
        <p>
          License issuance fees at enterprise scale: $0.0001-0.001 per license. Persistent
          licenses can be 2-10× more. Forensic watermarking adds another fraction of a cent.
          For a 1 M-viewer-day platform at 1 license per session that's $100-1000/day of pure
          DRM cost — significant only at scale, but a real line item.
        </p>

        <h3>This demo's analogue</h3>
        <p>
          The signed license-URL endpoint in this demo plays the entitlement role: it
          validates the viewer (signed URL = entitlement check), enforces a per-request nonce
          (one playback session), then returns the AES-128 key. Swap the plaintext key
          response for a CDM-specific license blob fetched from a DRMaaS vendor and you have
          production DRM — the rest of the architecture is identical.
        </p>
      </>
    ),
  },
  {
    slug: 'qc-vmaf',
    title: 'QC & VMAF — measuring perceptual quality',
    blurb: 'Why every ABR rung is graded against the source with VMAF before it ships.',
    render: () => (
      <>
        <p>
          When the pipeline emits a 1080p rendition at 3.2 Mbps, how do you know it's
          <em> actually</em> good? The packager's exit code says the bytes are valid HLS, but
          says nothing about whether the picture looks right. That's what <strong>QC (quality
          control)</strong> is — and at the heart of modern OTT QC sits <strong>VMAF</strong>,
          a perceptual quality metric originally developed at Netflix and now an industry
          standard.
        </p>

        <h3>Why VMAF, not PSNR or SSIM</h3>
        <p>
          <strong>PSNR</strong> measures per-pixel error against the source. It correlates
          poorly with how humans perceive quality — heavy compression can drop PSNR a lot
          while still looking fine, or boost PSNR while the image looks worse. <strong>SSIM
          </strong> compares structural similarity; better than PSNR but still purely
          mathematical.
        </p>
        <p>
          <strong>VMAF (Video Multi-method Assessment Fusion)</strong> is a machine-learning
          model trained on thousands of human ratings. It blends multiple per-frame features
          (VIF, ADM, motion) through a regressor to produce a score from <strong>0 to 100</strong>
          that maps to subjective opinion. The number is calibrated: <strong>95+ ≈ visually
          indistinguishable from source</strong>, <strong>90 ≈ great</strong>, <strong>80 ≈
          acceptable</strong>, <strong>below 70 ≈ users complain</strong>.
        </p>

        <h3>Bitrate vs quality, per resolution</h3>
        <div className="docs-figure">
          <VmafLadderFigure />
        </div>
        <p>
          Each resolution rung has a saturation curve. Push too few bits at 1080p and VMAF
          collapses; push too many at 480p and you're spending bandwidth past the point a
          human can tell. The <strong>knee</strong> of each curve is the sweet spot — the
          bitrate where one more megabit doesn't buy a perceptible improvement.
        </p>

        <h3>Per-title encoding</h3>
        <p>
          Traditional ABR ladders use a fixed bitrate per rung for every asset — 1080p at
          5 Mbps, 720p at 2.5 Mbps, etc. <strong>Per-title encoding</strong> recomputes the
          ladder per asset by sweeping bitrates and measuring VMAF per rung. A simple cartoon
          hits VMAF 95 at 1080p with 1.5 Mbps; a complex sports broadcast may need 7 Mbps.
          Netflix reports 20-30% bandwidth savings on the simple end of the catalog with no
          quality drop.
        </p>

        <h3>Where VMAF runs in the pipeline</h3>
        <ol>
          <li>
            Transcode produces N candidate renditions (one per ABR rung, possibly multiple
            bitrate trials per rung for per-title tuning).
          </li>
          <li>
            QC service downsamples each candidate to a common reference resolution, then runs
            FFmpeg's <code>libvmaf</code> filter against the mezzanine source to produce a
            VMAF score per frame.
          </li>
          <li>
            Aggregate scores (mean, p10, p1) decide whether the rung passes:
            <ul>
              <li>mean VMAF ≥ ladder target (e.g. 92 for 1080p)</li>
              <li>p10 VMAF ≥ floor (e.g. 80) — catches scenes that look bad even if the average is fine</li>
              <li>per-frame banding / blocking detectors (separate from VMAF) flag visible artifacts</li>
            </ul>
          </li>
          <li>Failing rungs trigger a re-encode at higher bitrate or a manual review queue.</li>
        </ol>

        <h3>VMAF flavors and pitfalls</h3>
        <ul>
          <li>
            <strong>VMAF NEG</strong> — a tuned model that resists enhancement gaming (sharpening
            an encode to boost VMAF without genuinely improving quality).
          </li>
          <li>
            <strong>4K VMAF</strong> — the default model is trained at 1080p; for 4K source comparison
            use the <code>vmaf_4k</code> model.
          </li>
          <li>
            <strong>Resolution mismatch</strong> — comparing a 720p encode to a 4K source naively
            penalizes the encode for not being 4K. Always upsample the encode to source
            resolution before scoring.
          </li>
          <li>
            <strong>HDR comparison</strong> — VMAF was trained on SDR. For HDR (PQ / HLG)
            the recommended approach is to score in the linear-light domain or use
            HDR-aware variants under active development.
          </li>
        </ul>

        <h3>What this demo doesn't do</h3>
        <p>
          The demo's pipeline transcodes once and ships. There's no VMAF scoring step,
          per-title sweep, or QC failure queue. The architecture doc in <code>/docs/vod-architecture.md</code>
          shows where it should live (the Package → DRM → QC → Publish chain), but the actual
          QC node is one of the <L slug="gaps">production gaps</L> deferred for scope.
        </p>
      </>
    ),
  },
  {
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
  },
  {
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
  },
  {
    slug: 'watermarking',
    title: 'Forensic watermarking',
    blurb: 'Two flavors of watermark, where each fits, and how A/B variant stitching traces leaks.',
    render: () => (
      <>
        <p>
          DRM stops a casual download. A leaker records the screen, screen-grabs at runtime,
          or uses a stripped-down rooted player to dump decrypted segments. The video escapes
          and now sits on a piracy site. <strong>Watermarking</strong> is the technique that
          lets you trace who leaked it.
        </p>

        <h3>Two distinct things</h3>
        <table className="docs-gaps">
          <thead><tr><th></th><th>Visible watermark</th><th>Forensic watermark</th></tr></thead>
          <tbody>
            <tr>
              <td><strong>Goal</strong></td>
              <td>deter leak; signal authenticity</td>
              <td>identify leaker after leak</td>
            </tr>
            <tr>
              <td><strong>Visibility</strong></td>
              <td>visible logo / ID burned in</td>
              <td>imperceptible to viewer</td>
            </tr>
            <tr>
              <td><strong>Survives</strong></td>
              <td>re-encoding obviously; can be cropped</td>
              <td>re-encoding, screen capture, format conversion</td>
            </tr>
            <tr>
              <td><strong>Cost</strong></td>
              <td>nearly free (overlay)</td>
              <td>~5-15% extra encoding cost; vendor royalties</td>
            </tr>
            <tr>
              <td><strong>Typical use</strong></td>
              <td>screeners, pre-release reviews, B2B</td>
              <td>4K premieres, sports, enterprise</td>
            </tr>
          </tbody>
        </table>

        <h3>A/B variant stitching — how forensic watermarking actually works</h3>
        <div className="docs-figure">
          <WatermarkingFigure />
        </div>
        <ol>
          <li>
            <strong>Offline.</strong> Encode <em>two</em> watermarked variants of every
            segment — variant A and variant B. The watermark is a tiny imperceptible pattern
            (in the DCT coefficients or luminance) that survives heavy compression. A and B
            are bit-identical to the eye but mathematically distinct under a detection model.
          </li>
          <li>
            <strong>Runtime.</strong> Per playback session, the Manifest service emits a
            stitched playlist that picks A or B per segment according to a bit pattern unique
            to the session ID. For a 90-minute film at 6-second segments, that's 900 segments
            = 900 bits = enough entropy to address 2<sup>900</sup> sessions (way more than
            humans on Earth).
          </li>
          <li>
            <strong>Detection.</strong> When a leaked file shows up, run the detector against
            each segment to read off its A/B bit. Concatenate the bits → look up the
            session ID → identify the leaker.
          </li>
        </ol>

        <h3>Where it plugs into the demo's pipeline</h3>
        <p>
          The architecture doc shows watermarking in the media pipeline (offline A/B variant
          encoding) plus the Manifest service (runtime stitching). Demo-side equivalents:
        </p>
        <ul>
          <li>
            <strong>Mezzanine + transcode</strong> would emit two variants per rung instead of
            one. Storage roughly doubles per rendition; some platforms run A/B at the top rung
            only (4K) since that's the high-value leak target.
          </li>
          <li>
            <strong>Origin layout</strong> — variants share segment numbering but differ in
            URL: <code>seg-0042-A.m4s</code> / <code>seg-0042-B.m4s</code>. Origin holds both.
          </li>
          <li>
            <strong>Manifest service</strong> consults a bit pattern derived from the session ID
            (HMAC over the user / device / session for unforgeability) and emits one playlist
            referencing the chosen variant per segment.
          </li>
          <li>
            <strong>Detection service</strong> is run after a leak is found. Vendors like
            Verimatrix, NexGuard, INKA Friend offer the detection API.
          </li>
        </ul>

        <h3>Alternative: client-side stitching</h3>
        <p>
          Some implementations push the A/B selection into the player — the player has a list
          of segment URLs and a bit pattern, and picks A or B locally. Pros: no per-session
          manifest cost. Cons: the bit pattern leaks if the player is reverse-engineered;
          colluding viewers can compare their files and reconstruct the watermark.
          Server-side stitching is the default for high-value content.
        </p>

        <h3>Forensic vendors (DRMaaS overlap)</h3>
        <ul>
          <li>
            <strong>Verimatrix VideoMark / NexGuard</strong> — used by major studios; A/B variant
            encoding + detection.
          </li>
          <li>
            <strong>BuyDRM Keyflower</strong> — multi-DRM stack with forensic add-on.
          </li>
          <li>
            <strong>PallyCon Forensic Watermark</strong> — popular in APAC, cost-efficient.
          </li>
          <li>
            <strong>Friend MTS ASiD</strong> — strong sports / live focus.
          </li>
        </ul>

        <h3>Limits</h3>
        <ul>
          <li>
            Collusion attacks: multiple viewers comparing their copies can reconstruct A vs B
            on a per-segment basis. Mitigation: <strong>collusion-resistant codes</strong>
            (Tardos codes) at the cost of higher detection threshold.
          </li>
          <li>
            Cropping / resize: a 10% crop usually preserves the watermark; a 50% crop may not.
          </li>
          <li>
            Audio-only leaks: watermark is usually video-only. Audio watermarking exists
            (Aurora, Civolution) but is a separate stack.
          </li>
          <li>
            Live: low-latency live raises the bar — stitching must happen at the manifest
            cadence (every few segments) with sub-second budget.
          </li>
        </ul>
      </>
    ),
  },
  {
    slug: 'ad-operations',
    title: 'Ad operations & monetization',
    blurb: 'Past the technical SSAI plumbing — CPM, fill rate, deal types, auction topology.',
    render: () => (
      <>
        <p>
          The <L slug="ssai">SSAI chapter</L> covers <em>how</em> ads get into the stream.
          This chapter covers <em>why</em> a particular ad ends up in a particular slot —
          the business plumbing that decides which ad wins, what it pays, and how the
          publisher gets credit.
        </p>

        <h3>Pricing models</h3>
        <table className="docs-gaps">
          <thead><tr><th>Model</th><th>What advertiser pays for</th><th>Typical OTT CPM</th></tr></thead>
          <tbody>
            <tr><td><strong>CPM</strong> (cost per mille)</td><td>1000 impressions delivered</td><td>$15-$40 US OTT premium</td></tr>
            <tr><td><strong>CPCV</strong> (cost per completed view)</td><td>impression watched to ≥95%</td><td>$25-$60 (premium video)</td></tr>
            <tr><td><strong>CPC</strong> (cost per click)</td><td>click on companion / overlay</td><td>$0.50-$5 (rare in video)</td></tr>
            <tr><td><strong>CPA</strong> (cost per action)</td><td>signup / purchase</td><td>$5-$50 (direct-response)</td></tr>
            <tr><td><strong>Flat rate</strong></td><td>guaranteed campaign delivery</td><td>negotiated</td></tr>
          </tbody>
        </table>
        <p>
          OTT is dominated by CPM and CPCV. CPCV is preferred by brand advertisers because it
          aligns spend with engagement (the user actually watched). For the publisher, eCPM
          (effective CPM = total revenue / impressions × 1000) is the single number to track.
        </p>

        <h3>Fill rate</h3>
        <p>
          The percentage of ad opportunities that get filled with a paying ad.
        </p>
        <ul>
          <li>
            <strong>Premium fill rate</strong>: % filled at the publisher's floor price.
            Healthy is 70-90%.
          </li>
          <li>
            <strong>Total fill rate (including house ads / remnant)</strong>: should be 100%
            — every slot must show <em>something</em>. House fills with promos, charity PSAs,
            or low-CPM remnant networks.
          </li>
          <li>
            <strong>Unfilled = ad-service "no-fill" response.</strong> The SSAI stitcher must
            handle this by either skipping the break (HLS gap, easier said than done) or
            inserting a house creative.
          </li>
        </ul>

        <h3>Deal types</h3>
        <table className="docs-gaps">
          <thead><tr><th>Type</th><th>How it works</th><th>Where it fits</th></tr></thead>
          <tbody>
            <tr>
              <td><strong>Direct / IO</strong></td>
              <td>publisher and advertiser sign an Insertion Order; guaranteed delivery</td>
              <td>premium upfront commitments</td>
            </tr>
            <tr>
              <td><strong>PG</strong> (Programmatic Guaranteed)</td>
              <td>guaranteed CPM and volume, delivered programmatically via DSP/SSP</td>
              <td>large advertisers wanting automation</td>
            </tr>
            <tr>
              <td><strong>PMP</strong> (Private Marketplace)</td>
              <td>invite-only auction with curated buyers; floor price per deal ID</td>
              <td>premium publishers who want auction efficiency without open exchange</td>
            </tr>
            <tr>
              <td><strong>Open exchange (OMP)</strong></td>
              <td>real-time bidding among any DSPs that subscribe</td>
              <td>backfill / remnant; lowest CPMs but highest fill</td>
            </tr>
          </tbody>
        </table>
        <p>
          A real publisher runs all four in priority order: direct/PG fills first, then PMP,
          then open exchange, then house ads.
        </p>

        <h3>Auction topology — waterfall vs unified</h3>
        <div className="docs-figure">
          <AdAuctionFigure />
        </div>
        <p>
          <strong>Waterfall</strong>: query DSPs sequentially in a fixed priority. First DSP
          that bids above the floor wins. Easy to implement; loses revenue because higher
          bidders further down the chain are never queried.
        </p>
        <p>
          <strong>Unified auction</strong> (a.k.a. header bidding for video, prebid wrapper,
          server-side header bidding): query all DSPs in parallel and pick the highest bid.
          Modern standard. Typical revenue uplift versus waterfall: 20-30%. The catch is
          latency — every bidder must respond inside the same window (~150-200 ms for video),
          so timeouts are aggressive.
        </p>

        <h3>Brand safety / suitability</h3>
        <p>
          A car ad next to a graphic news clip is bad for both sides. Brand suitability is the
          set of rules that prevents this:
        </p>
        <ul>
          <li>
            <strong>IAB Content Taxonomy</strong> classifies the program (genre, themes, tone).
          </li>
          <li>
            <strong>Page-level signals</strong> from the metadata layer flag a program's
            rating, themes, advisories.
          </li>
          <li>
            <strong>Advertiser filters</strong> say "no news, no horror, no shows with adult
            language". The ad-server enforces this before allowing a bid.
          </li>
          <li>
            <strong>Brand-safety scanners</strong> (DoubleVerify, Integral Ad Science) score
            inventory in real time and provide post-buy reports.
          </li>
        </ul>

        <h3>Frequency caps</h3>
        <ul>
          <li>
            <strong>Per-user</strong>: a single creative may show at most N times per day /
            week / campaign. Bedrock for not annoying viewers.
          </li>
          <li>
            <strong>Per-pod</strong>: don't show two ads from the same advertiser in the same
            break.
          </li>
          <li>
            <strong>Competitive separation</strong>: don't show Pepsi right after Coke.
          </li>
          <li>
            <strong>State (across devices)</strong>: frequency is per user-identity, not
            per-device. Requires user identity to carry across phone / TV / web (cookies are
            useless on TV). Hence the rise of identity solutions (ID5, RampID, UID 2.0).
          </li>
        </ul>

        <h3>Attribution</h3>
        <p>
          Did the ad work? Three approaches:
        </p>
        <ul>
          <li>
            <strong>Last-touch click attribution</strong> — only useful for direct-response.
          </li>
          <li>
            <strong>View-through attribution</strong> — if user signed up within N days of
            seeing the ad, credit the ad. Standard for brand video.
          </li>
          <li>
            <strong>Incrementality testing</strong> — randomized holdouts measure lift over
            no-ad control. Methodologically the only attribution that survives scrutiny;
            adoption growing fast.
          </li>
        </ul>

        <h3>What this demo doesn't model</h3>
        <p>
          The demo's ad-service serves a single hard-coded pre-roll, no auction. Real
          monetization stacks layer SSP / DSP / DMP / identity providers in front of the SSAI
          stitcher. The technical splice is the easy bit — the auction and attribution layer
          is where the revenue happens.
        </p>
      </>
    ),
  },
  {
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
  },
  {
    slug: 'concurrent-streams',
    title: 'Concurrent streams & account-sharing limits',
    blurb: 'Token + device fingerprint + heartbeat = the household contract every OTT enforces.',
    render: () => (
      <>
        <p>
          Every OTT subscription has a household limit — Netflix Standard caps at 2
          simultaneous streams, Premium at 4; Disney+ at 4; HBO Max at 3; etc. Enforcing this
          is a deceptively hard distributed-systems problem: the streams are on different
          devices in different cities issuing different requests, and yet the platform must
          decide in milliseconds whether one more request crosses the line.
        </p>

        <h3>The decision flow</h3>
        <div className="docs-figure">
          <ConcurrentStreamGuardFigure />
        </div>

        <h3>Three signals, one decision</h3>
        <ol>
          <li>
            <strong>Token validity</strong> — JWT (or opaque session) issued at login, bound
            to a device. Expired or revoked → deny.
          </li>
          <li>
            <strong>Device fingerprint</strong> — composite of model, OS version, app build,
            hardware identifier, network. Stable enough to recognize the same device, fuzzy
            enough to survive an OS update. The platform stores the user's registered devices
            and limits how many can stream concurrently.
          </li>
          <li>
            <strong>Concurrent count</strong> — a counter keyed by the account ID. Decremented
            on session end (explicit signout, heartbeat timeout, license expiry).
          </li>
        </ol>

        <h3>The concurrent-count problem</h3>
        <p>
          Naively: keep a Redis counter per account. Increment on play, decrement on stop.
          The catch is that clients lie about stopping — they close the laptop lid, lose
          connectivity, get killed by the OS, all without sending the "stop" event.
        </p>
        <p>
          Production solution is <strong>heartbeats</strong>: the player POSTs every 30-60s
          while a session is active. The server treats absence-of-heartbeat as session end
          and decrements the counter after a grace period (~90 s). Heartbeats also carry CMCD-style
          QoS data so this endpoint is genuinely multi-purpose.
        </p>

        <h3>Household definition</h3>
        <p>
          "Household" is the policy lever for account sharing. Different platforms set it
          differently:
        </p>
        <ul>
          <li>
            <strong>Strict household</strong> (Netflix 2023+): primary home anchored by IP /
            GPS / device. Outside-home streams require step-up auth or a paid "extra member"
            slot.
          </li>
          <li>
            <strong>Soft household</strong> (most others): any device that has logged in
            counts toward the cap; ignored where they sit geographically.
          </li>
          <li>
            <strong>Profile-based</strong>: profiles within an account are not separate
            households; they all share the cap.
          </li>
        </ul>

        <h3>Step-up auth</h3>
        <p>
          When a stream looks suspicious — new device, new geography, exceeded cap — the
          right answer is not always "deny". The right answer is often <strong>step-up</strong>:
          ask the user to confirm via email / SMS / password re-entry. Real households move,
          travel, lend a TV to a relative. Step-up authenticates intent without burning the
          user's trust.
        </p>

        <h3>License Server's role</h3>
        <p>
          The cap is enforced not just at play-auth time but at every license issuance. The
          License Server checks "is this device's session still counted, and are we within the
          cap?" before minting a fresh license. If a fourth stream sneaks past play-auth via a
          race, the License Server is the second gate.
        </p>

        <h3>Geo drift detection</h3>
        <p>
          Two streams from the same account, one in Seattle and one in Mumbai, at the same
          time, with no plausible travel between them: that's not concurrent viewing, that's
          credential sharing. Detection signals:
        </p>
        <ul>
          <li>
            <strong>Geo distance / time</strong> — implausible travel rate between sessions.
          </li>
          <li>
            <strong>Network ASN</strong> — same account on two unrelated ASNs over the past
            month with no overlap.
          </li>
          <li>
            <strong>Device diversity</strong> — six different makes/models in a year on what
            should be a four-person household.
          </li>
        </ul>
        <p>
          These do <em>not</em> automatically deny — they feed a risk score that triggers
          step-up at the next session boundary, or a quiet email warning.
        </p>

        <h3>Paid extra slots</h3>
        <p>
          Once enforcement is real, the natural product question is: how does a user who
          legitimately has a college student abroad keep them streaming? Answer: a paid
          add-on slot tied to that device. Most major OTTs introduced this between 2022 and 2024
          after years of soft enforcement.
        </p>

        <h3>What this demo doesn't enforce</h3>
        <p>
          The demo issues one access token per login with no concurrent-stream tracking. A
          single user could open the player in N tabs and stream all N simultaneously.
          Production parity would add a Redis-backed concurrent counter, a heartbeat endpoint,
          and a License Server gate.
        </p>
      </>
    ),
  },
  {
    slug: 'epg-fast',
    title: 'FAST channels & EPG',
    blurb: 'Linear streaming returns: how on-demand platforms run free ad-supported channels.',
    render: () => (
      <>
        <p>
          Linear TV came back. <strong>FAST</strong> (Free Ad-supported Streaming TV) channels
          — Pluto, Tubi, Samsung TV Plus, the linear lanes inside Roku and Peacock — re-introduce
          the broadcast model on top of OTT plumbing. The viewer tunes in, watches what's
          playing now, and ads pay the bill. Users don't always realize they're using an
          on-demand platform's CDN; engineers absolutely do.
        </p>

        <h3>Channel as schedule, not as bytes</h3>
        <p>
          A FAST channel is fundamentally a <strong>schedule</strong>: a list of program assets
          + ad slots laid out on a wall clock. The player gets a live manifest that points at
          the program currently scheduled, then transitions at break boundaries. The
          underlying segments are usually CDN-cached VOD bytes — what changes is which playlist
          ref points where.
        </p>

        <h3>Evening schedule slice</h3>
        <div className="docs-figure">
          <FastEpgFigure />
        </div>

        <h3>EPG — Electronic Programming Guide</h3>
        <p>
          The schedule lives in an EPG: a structured representation of every channel × every
          time slot. Typical shape per entry:
        </p>
        <ul>
          <li>channel ID, program ID, asset ID</li>
          <li>start time / end time (UTC, wall clock)</li>
          <li>episode metadata (season, episode, synopsis, rating)</li>
          <li>ad break markers (where SSAI will splice)</li>
          <li>localization (regional schedule variants)</li>
        </ul>
        <p>
          EPG data is usually published as <strong>XMLTV</strong> or its successors — a flat
          file or feed updated daily, ingested by the client and the manifest service in
          tandem.
        </p>

        <h3>SCTE-35 markers</h3>
        <p>
          Inside the stream, SCTE-35 binary messages signal where breaks open and close. The
          live encoder injects them at the right PTS; the SSAI stitcher reads them and either
          splices in an ad pod or passes the program through. Each marker carries:
        </p>
        <ul>
          <li>
            <strong>splice_event_id</strong> — unique handle for this break
          </li>
          <li>
            <strong>splice_command_type</strong> — typically <code>splice_insert</code> (start
            or end) or <code>time_signal</code>
          </li>
          <li>
            <strong>break_duration</strong> — how long the break is allowed to be
          </li>
          <li>
            <strong>upid (Universal Program ID)</strong> — what program is starting / ending
          </li>
        </ul>
        <p>
          SSAI for linear is significantly harder than for VOD: the splice has to be exact to
          the frame, the ad pod has to fit in the allotted duration (no overrun), and the
          decisioning + encoding must happen in the seconds before the marker hits the player.
        </p>

        <h3>Player UX — what a FAST player does differently</h3>
        <ul>
          <li>
            <strong>No seek bar</strong> (or a heavily limited DVR window — usually 30 min
            back). Pure linear means seeking forward is impossible.
          </li>
          <li>
            <strong>Channel zapping</strong> — left/right or up/down switches channels in
            under a second. The manifest service must be ready to serve a new channel's
            manifest immediately; usually achieved by warm caches per channel.
          </li>
          <li>
            <strong>"Now / Next"</strong> overlay shows what's playing and what's after,
            populated from EPG.
          </li>
          <li>
            <strong>Replay-from-live</strong> — some FAST platforms let viewers restart the
            current program from its beginning. Implemented via a separate VOD asset linked
            from the EPG entry.
          </li>
        </ul>

        <h3>FAST vs vMVPD vs OTT-on-demand</h3>
        <table className="docs-gaps">
          <thead><tr><th>Model</th><th>Cost</th><th>Catalog</th><th>Examples</th></tr></thead>
          <tbody>
            <tr>
              <td><strong>FAST</strong></td>
              <td>free, ad-supported</td>
              <td>aggregated channels, often deep back catalog</td>
              <td>Pluto, Tubi, Samsung TV+, Roku Channel</td>
            </tr>
            <tr>
              <td><strong>vMVPD</strong></td>
              <td>paid subscription</td>
              <td>live cable bundle over IP</td>
              <td>YouTube TV, Hulu Live, Sling, DirecTV Stream</td>
            </tr>
            <tr>
              <td><strong>SVOD</strong></td>
              <td>paid subscription</td>
              <td>on-demand library</td>
              <td>Netflix, Disney+, HBO Max</td>
            </tr>
            <tr>
              <td><strong>AVOD / FAST-on-VOD</strong></td>
              <td>free, ad-supported</td>
              <td>on-demand library</td>
              <td>Tubi, Crackle, Freevee</td>
            </tr>
          </tbody>
        </table>

        <h3>Why FAST grew</h3>
        <ul>
          <li>
            <strong>Lower decision burden</strong> — many viewers prefer "what's on" to
            scrolling a catalog grid.
          </li>
          <li>
            <strong>Smart TV defaults</strong> — most CTV manufacturers ship FAST tiles on the
            home screen. Discovery is free.
          </li>
          <li>
            <strong>Cheap content reuse</strong> — back catalogs of broadcasters and studios
            slot into FAST channels with low incremental cost.
          </li>
          <li>
            <strong>Ad inventory growth</strong> — 100% ad-supported viewing time means more
            slots than SVOD's "ad tier".
          </li>
        </ul>

        <h3>What this demo doesn't have</h3>
        <p>
          The demo is strictly VOD: one asset, one manifest, no schedule, no SCTE-35, no FAST
          mode. Production parity for FAST would add an EPG service, a live-manifest origin
          per channel, a SCTE-35-aware SSAI stitcher, and a channel-switching player UX.
        </p>
      </>
    ),
  },
]

// Part / chapter grouping. Reading order is computed from this — the CHAPTERS
// array's own order is irrelevant for navigation now, only used as a slug
// lookup. Adding a new chapter: drop it in the CHAPTERS array, then list its
// slug under the appropriate part below.
const PARTS: { name: string; slugs: string[] }[] = [
  {
    name: 'Foundations',
    slugs: ['guide', 'overview', 'audio-basics', 'video-basics', 'color-basics', 'time-timestamps', 'crypto-basics', 'networking-basics', 'hls', 'containers', 'codecs', 'manifest'],
  },
  {
    name: 'The publishing pipeline',
    slugs: ['mezzanine', 'transcode-package', 'qc-vmaf', 'captions', 'ssai'],
  },
  {
    name: 'Delivery & playback',
    slugs: ['cdn', 'cmcd', 'player', 'trick-play', 'live', 'epg-fast', 'observability', 'devices'],
  },
  {
    name: 'Content & business',
    slugs: ['metadata', 'cms-editorial', 'catalog', 'search', 'recommendation', 'ad-operations', 'cost', 'payments', 'compliance', 'privacy'],
  },
  {
    name: 'Identity & security',
    slugs: ['auth', 'identity', 'concurrent-streams', 'drm', 'multi-drm', 'watermarking', 'anti-piracy'],
  },
  {
    name: 'Reference',
    slugs: ['standards', 'gaps', 'glossary'],
  },
]

const READING_ORDER: string[] = PARTS.flatMap((p) => p.slugs)

// Hand-estimated reading minutes per chapter (rough — based on word count
// + table density at ~220 wpm). Drives the eyebrow's "~N min read" hint.
const READING_MINUTES: Record<string, number> = {
  guide: 3,
  overview: 4,
  'audio-basics': 5,
  'video-basics': 6,
  'color-basics': 6,
  'time-timestamps': 7,
  'crypto-basics': 7,
  'networking-basics': 6,
  hls: 6,
  containers: 5,
  codecs: 7,
  manifest: 8,
  mezzanine: 6,
  'transcode-package': 7,
  'qc-vmaf': 7,
  captions: 7,
  ssai: 8,
  cdn: 7,
  cmcd: 7,
  player: 7,
  'trick-play': 5,
  live: 7,
  'epg-fast': 7,
  observability: 5,
  devices: 7,
  metadata: 7,
  'cms-editorial': 7,
  catalog: 6,
  search: 6,
  recommendation: 9,
  'ad-operations': 8,
  cost: 5,
  payments: 7,
  compliance: 7,
  privacy: 7,
  auth: 7,
  identity: 7,
  'concurrent-streams': 7,
  drm: 8,
  'multi-drm': 7,
  watermarking: 7,
  'anti-piracy': 7,
  standards: 4,
  gaps: 5,
  glossary: 6,
}

// Inter-chapter cross-references. Each chapter lists the slugs of one to
// three other chapters most worth reading right after it. Reference-only
// chapters (standards / gaps / glossary) intentionally have no See also.
const SEE_ALSO: Record<string, string[]> = {
  overview: ['guide', 'gaps'],
  'audio-basics': ['codecs', 'mezzanine'],
  'video-basics': ['color-basics', 'codecs'],
  'color-basics': ['video-basics', 'mezzanine'],
  'time-timestamps': ['live', 'ssai', 'trick-play'],
  'crypto-basics': ['drm', 'auth', 'anti-piracy'],
  'networking-basics': ['cdn', 'live', 'player'],
  hls: ['manifest', 'containers'],
  containers: ['codecs', 'manifest'],
  codecs: ['audio-basics', 'video-basics', 'transcode-package'],
  manifest: ['hls', 'ssai'],
  mezzanine: ['transcode-package', 'codecs'],
  'transcode-package': ['qc-vmaf', 'codecs', 'cdn'],
  'qc-vmaf': ['transcode-package', 'codecs', 'gaps'],
  captions: ['compliance', 'manifest'],
  ssai: ['manifest', 'ad-operations', 'live'],
  cdn: ['cmcd', 'player', 'cost'],
  cmcd: ['cdn', 'player', 'observability'],
  player: ['drm', 'trick-play', 'devices'],
  'trick-play': ['manifest', 'player'],
  live: ['ssai', 'epg-fast', 'observability'],
  'epg-fast': ['live', 'ssai', 'ad-operations'],
  observability: ['player', 'cmcd', 'cdn'],
  devices: ['player', 'multi-drm'],
  metadata: ['cms-editorial', 'catalog', 'compliance'],
  'cms-editorial': ['metadata', 'compliance'],
  catalog: ['search', 'recommendation', 'metadata'],
  search: ['catalog', 'recommendation', 'metadata'],
  recommendation: ['catalog', 'search'],
  'ad-operations': ['ssai', 'epg-fast', 'privacy'],
  cost: ['cdn', 'transcode-package'],
  payments: ['identity', 'compliance'],
  compliance: ['privacy', 'captions'],
  privacy: ['compliance', 'identity', 'ad-operations'],
  auth: ['identity', 'concurrent-streams', 'drm'],
  identity: ['auth', 'concurrent-streams', 'payments'],
  'concurrent-streams': ['identity', 'auth', 'multi-drm'],
  drm: ['multi-drm', 'watermarking', 'anti-piracy'],
  'multi-drm': ['drm', 'watermarking', 'anti-piracy'],
  watermarking: ['anti-piracy', 'multi-drm'],
  'anti-piracy': ['watermarking', 'multi-drm', 'identity'],
}

const CHAPTERS_BY_SLUG: Record<string, Chapter> = Object.fromEntries(
  CHAPTERS.map((c) => [c.slug, c]),
)

function readHashSlug(): string {
  const m = /^#\/docs\/([\w-]+)/.exec(window.location.hash)
  if (m && CHAPTERS_BY_SLUG[m[1]]) return m[1]
  return READING_ORDER[0]
}

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']

export function Docs() {
  const [activeSlug, setActiveSlug] = useState<string>(readHashSlug)

  useEffect(() => {
    if (window.location.hash !== `#/docs/${activeSlug}`) {
      window.history.replaceState(null, '', `#/docs/${activeSlug}`)
    }
  }, [activeSlug])

  useEffect(() => {
    const onHash = () => setActiveSlug(readHashSlug())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const ch = CHAPTERS_BY_SLUG[activeSlug] ?? CHAPTERS_BY_SLUG[READING_ORDER[0]]
  const idx = READING_ORDER.indexOf(activeSlug)
  const prevSlug = idx > 0 ? READING_ORDER[idx - 1] : null
  const nextSlug = idx >= 0 && idx < READING_ORDER.length - 1 ? READING_ORDER[idx + 1] : null
  const prev = prevSlug ? CHAPTERS_BY_SLUG[prevSlug] : null
  const next = nextSlug ? CHAPTERS_BY_SLUG[nextSlug] : null

  return (
    <div className="docs-layout">
      <aside className="docs-toc">
        {PARTS.map((part, partIdx) => (
          <div className="docs-toc-part" key={part.name}>
            <div className="docs-toc-part-label">
              <span className="docs-toc-part-num">PART {ROMAN[partIdx] ?? String(partIdx + 1)}</span>
              <span className="docs-toc-part-name">{part.name}</span>
            </div>
            <ol>
              {part.slugs.map((slug) => {
                const c = CHAPTERS_BY_SLUG[slug]
                if (!c) return null
                const overallIdx = READING_ORDER.indexOf(slug)
                return (
                  <li key={slug} className={slug === activeSlug ? 'active' : ''}>
                    <button onClick={() => setActiveSlug(slug)}>
                      <span className="docs-toc-num">
                        {String(overallIdx + 1).padStart(2, '0')}
                      </span>
                      <span className="docs-toc-title">{c.title}</span>
                    </button>
                  </li>
                )
              })}
            </ol>
          </div>
        ))}
      </aside>
      <article className="docs-content panel">
        <div className="docs-chapter-eyebrow">
          Chapter {idx + 1} of {READING_ORDER.length}
          {READING_MINUTES[ch.slug] ? <> · ~{READING_MINUTES[ch.slug]} min read</> : null}
        </div>
        <h1 className="docs-chapter-title">{ch.title}</h1>
        <p className="docs-chapter-blurb">{ch.blurb}</p>
        <div className="docs-prose">{ch.render()}</div>
        {SEE_ALSO[ch.slug] && SEE_ALSO[ch.slug].length > 0 && (
          <div className="docs-see-also">
            <span className="docs-see-also-label">SEE ALSO</span>
            {SEE_ALSO[ch.slug].map((s, i) => {
              const c = CHAPTERS_BY_SLUG[s]
              if (!c) return null
              return (
                <span key={s} className="docs-see-also-item">
                  {i > 0 && <span className="docs-see-also-sep">·</span>}
                  <button onClick={() => setActiveSlug(s)}>{c.title}</button>
                </span>
              )
            })}
          </div>
        )}
        <nav className="docs-pager">
          {prev ? (
            <button
              className="secondary docs-pager-link"
              onClick={() => setActiveSlug(prev.slug)}
            >
              <ChevronLeft size={14} />
              <span>
                <span className="docs-pager-dir">Previous</span>
                <span className="docs-pager-title">{prev.title}</span>
              </span>
            </button>
          ) : (
            <span />
          )}
          {next ? (
            <button
              className="secondary docs-pager-link docs-pager-link-right"
              onClick={() => setActiveSlug(next.slug)}
            >
              <span>
                <span className="docs-pager-dir">Next</span>
                <span className="docs-pager-title">{next.title}</span>
              </span>
              <ChevronRight size={14} />
            </button>
          ) : (
            <span />
          )}
        </nav>
      </article>
    </div>
  )
}
