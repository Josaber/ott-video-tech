import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ArchitectureDiagram } from './ArchitectureDiagram'
import { Glossary } from './Glossary'

interface Chapter {
  slug: string
  title: string
  blurb: string
  render: () => JSX.Element
}

const CHAPTERS: Chapter[] = [
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

        <h3>What this demo skips</h3>
        <p>
          Everything in this chapter. <code>VideoAssetEntity</code> is a flat record with no
          program / season / episode structure, no rights window, no localisation, no external
          identifiers. The catalog endpoint is just "list every asset visible to this user" — no
          filtering, sorting, or merchandising. The first half of <em>Production gaps</em>
          (multi-tenancy, geofencing, ratings) are all metadata-driven concerns that need this
          layer before they can be implemented at all.
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
    slug: 'containers',
    title: 'Video containers',
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
        <h3>Video codecs</h3>
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
          a specific resolution and bitrate.
        </p>
        <p>
          A production <strong>ABR ladder</strong> is the set of renditions you offer:
        </p>
        <pre><code>{`Ladder example
  240p   H.264   400  kbps   (mobile, weak connection)
  360p   H.264   800  kbps
  480p   H.264  1400  kbps
  720p   H.264  2800  kbps
  1080p  H.264  5000  kbps
  4K HDR H.265 12000  kbps   (CTV with HEVC decoder)`}</code></pre>
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
    slug: 'gaps',
    title: 'Production gaps',
    blurb: 'What this demo deliberately skips, and where you would add it in real OTT.',
    render: () => (
      <>
        <p>
          This is a teaching demo — it covers the spine of an OTT publishing platform but
          deliberately leaves out everything operational. The list below is what you would build
          before sending traffic to humans.
        </p>
        <table className="docs-gaps">
          <thead>
            <tr>
              <th>Gap</th>
              <th>Real solution</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>No multi-tenancy</td>
              <td><code>VideoAssetEntity</code> has no <code>owner_id</code>. Add it + an authorization rule in the controller.</td>
            </tr>
            <tr>
              <td>No CDN</td>
              <td>Backend serves segments directly. Production hides origin behind CloudFront / Fastly / Akamai with token-signed URLs.</td>
            </tr>
            <tr>
              <td>Single rendition</td>
              <td>Real ABR ladder: 360p / 480p / 720p / 1080p, keyframe-aligned, signaled in master playlist.</td>
            </tr>
            <tr>
              <td>DRM-lite, not real DRM</td>
              <td>Widevine / FairPlay / PlayReady via EME + license server. See the DRM chapter.</td>
            </tr>
            <tr>
              <td>No captions / multi-audio</td>
              <td>Add <code>EXT-X-MEDIA TYPE=SUBTITLES</code> and <code>TYPE=AUDIO</code> groups; ship WebVTT / TTML sidecars.</td>
            </tr>
            <tr>
              <td>No live streaming</td>
              <td>Demo is VOD only. Live requires an encoder feeding HLS / LL-HLS or DASH, with SCTE-35 ad cues.</td>
            </tr>
            <tr>
              <td>No rate limiting</td>
              <td><code>/auth/login</code> and <code>/auth/register</code> accept unlimited attempts. Add bucket4j + IP + username pacing.</td>
            </tr>
            <tr>
              <td>No password policy</td>
              <td>Min length only. Production wants entropy checks + breach-database lookups (HIBP API).</td>
            </tr>
            <tr>
              <td>No geofencing or ratings</td>
              <td>License URL endpoint would consult a per-asset country whitelist + content rating before issuing the key.</td>
            </tr>
            <tr>
              <td>No QoE telemetry</td>
              <td>Send CMCD headers from the player, ingest player events server-side, surface in a Conviva / Mux Data dashboard.</td>
            </tr>
            <tr>
              <td>Synchronous ad cold-start</td>
              <td>Ad-service uses on-demand FFmpeg; first <code>/vast</code> takes ~48 s. Warm the catalog at boot or pre-bake renditions.</td>
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
]

function readHashChapter(): number {
  const m = /^#\/docs\/([\w-]+)/.exec(window.location.hash)
  if (!m) return 0
  const idx = CHAPTERS.findIndex((c) => c.slug === m[1])
  return idx >= 0 ? idx : 0
}

export function Docs() {
  const [active, setActive] = useState<number>(() => readHashChapter())

  useEffect(() => {
    const next = CHAPTERS[active]
    if (next && window.location.hash !== `#/docs/${next.slug}`) {
      window.history.replaceState(null, '', `#/docs/${next.slug}`)
    }
  }, [active])

  useEffect(() => {
    const onHash = () => setActive(readHashChapter())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const ch = CHAPTERS[active]
  const prev = active > 0 ? CHAPTERS[active - 1] : null
  const next = active < CHAPTERS.length - 1 ? CHAPTERS[active + 1] : null

  return (
    <div className="docs-layout">
      <aside className="docs-toc">
        <div className="docs-toc-label">Chapters</div>
        <ol>
          {CHAPTERS.map((c, i) => (
            <li key={c.slug} className={i === active ? 'active' : ''}>
              <button onClick={() => setActive(i)}>
                <span className="docs-toc-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="docs-toc-title">{c.title}</span>
              </button>
            </li>
          ))}
        </ol>
      </aside>
      <article className="docs-content panel">
        <div className="docs-chapter-eyebrow">
          Chapter {active + 1} of {CHAPTERS.length}
        </div>
        <h1 className="docs-chapter-title">{ch.title}</h1>
        <p className="docs-chapter-blurb">{ch.blurb}</p>
        <div className="docs-prose">{ch.render()}</div>
        <nav className="docs-pager">
          {prev ? (
            <button className="secondary docs-pager-link" onClick={() => setActive(active - 1)}>
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
              onClick={() => setActive(active + 1)}
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
