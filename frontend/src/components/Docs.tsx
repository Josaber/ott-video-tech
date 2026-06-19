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
        <p>Classic HLS, viewer to encoder:</p>
        <ul>
          <li>Encoder I-frame interval / GOP: 2-4 s</li>
          <li>Contribution to packager: 1-2 s</li>
          <li>Packager segmenting + writing: 0-1 s</li>
          <li>CDN propagation: 0-1 s</li>
          <li>Player buffer (safe ABR target): 6-15 s</li>
          <li><strong>Total: 9-23 s</strong></li>
        </ul>
        <p>
          WebRTC end-to-end pushes the total to ~500 ms — at the cost of MSE / EME ecosystem
          support and ABR sophistication.
        </p>
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
              <td>MPEG-TS works everywhere but CMAF .m4s lets one segment set serve both HLS and DASH. See <em>Video containers</em>.</td>
            </tr>
            <tr>
              <td>No captions / multi-audio</td>
              <td>No <code>EXT-X-MEDIA TYPE=SUBTITLES</code> or <code>TYPE=AUDIO</code> groups, no WebVTT / TTML sidecars, no dub tracks.</td>
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
          </tbody>
        </table>
        <h3>Security & rights</h3>
        <table className="docs-gaps">
          <thead><tr><th>Gap</th><th>Real solution</th></tr></thead>
          <tbody>
            <tr>
              <td>DRM-lite, not real DRM</td>
              <td>AES-128 + HMAC-signed URL. Real OTT uses Widevine / FairPlay / PlayReady via EME + a CDM. See <em>DRM</em>.</td>
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

// Part / chapter grouping. Reading order is computed from this — the CHAPTERS
// array's own order is irrelevant for navigation now, only used as a slug
// lookup. Adding a new chapter: drop it in the CHAPTERS array, then list its
// slug under the appropriate part below.
const PARTS: { name: string; slugs: string[] }[] = [
  {
    name: 'Foundations',
    slugs: ['overview', 'hls', 'containers', 'codecs', 'manifest'],
  },
  {
    name: 'The publishing pipeline',
    slugs: ['mezzanine', 'transcode-package', 'ssai'],
  },
  {
    name: 'Delivery & playback',
    slugs: ['cdn', 'player', 'live', 'observability'],
  },
  {
    name: 'Content & business',
    slugs: ['metadata', 'catalog', 'cost', 'compliance'],
  },
  {
    name: 'Security',
    slugs: ['auth', 'drm', 'anti-piracy'],
  },
  {
    name: 'Reference',
    slugs: ['standards', 'gaps', 'glossary'],
  },
]

const READING_ORDER: string[] = PARTS.flatMap((p) => p.slugs)

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
        </div>
        <h1 className="docs-chapter-title">{ch.title}</h1>
        <p className="docs-chapter-blurb">{ch.blurb}</p>
        <div className="docs-prose">{ch.render()}</div>
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
