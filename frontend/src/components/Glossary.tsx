interface Term {
  abbr: string
  full: string
  note: string
}

const TERMS: Term[] = [
  // Domain ---------------------------------------------------------------
  {
    abbr: 'OTT',
    full: 'Over-The-Top',
    note: 'Video delivered over the public internet, bypassing traditional cable / satellite distribution.',
  },
  {
    abbr: 'VOD',
    full: 'Video on Demand',
    note: 'Pre-encoded library that viewers stream when they choose, as opposed to a live linear channel.',
  },
  {
    abbr: 'ABR',
    full: 'Adaptive Bitrate Streaming',
    note: 'Encode the same video at several quality levels; the player switches up or down per segment based on measured network throughput.',
  },
  {
    abbr: 'CDN',
    full: 'Content Delivery Network',
    note: 'Distributed edge cache (CloudFront, Akamai, Fastly...) that serves the manifest and segments close to the viewer. This demo skips it — backend serves directly.',
  },

  // Distribution & monetization -----------------------------------------
  {
    abbr: 'Live',
    full: 'Live streaming',
    note: 'Encoder feeds fresh segments while viewers watch. Manifest is a sliding window. Latency and DVR rules matter; pre-encoded VOD has neither.',
  },
  {
    abbr: 'Linear',
    full: 'Linear (channel) programming',
    note: 'Scheduled programming on a fixed channel — broadcast TV\'s native pattern, replicated on OTT for FAST channels and 24/7 news / sports.',
  },
  {
    abbr: 'PPV',
    full: 'Pay-Per-View',
    note: 'Viewer pays once for a single event or title. Boxing / UFC nights, premium concerts, day-and-date movie releases — usually combined with Live.',
  },
  {
    abbr: 'SVOD',
    full: 'Subscription VOD',
    note: 'Monthly fee, generally ad-free, full catalog access (Netflix, Disney+, HBO Max).',
  },
  {
    abbr: 'AVOD',
    full: 'Ad-supported VOD',
    note: 'Free for the viewer; revenue is ad impressions. YouTube\'s free tier, Pluto TV on-demand, Tubi.',
  },
  {
    abbr: 'TVOD',
    full: 'Transactional VOD',
    note: 'Rent or buy individual titles — Apple TV / iTunes, Amazon Video purchases, day-and-date premium movies.',
  },
  {
    abbr: 'FAST',
    full: 'Free Ad-Supported Streaming TV',
    note: 'Linear channels delivered via OTT (Pluto TV, Samsung TV Plus, Roku Channel). Fastest-growing US ad-supported category since 2022.',
  },
  {
    abbr: 'CTV',
    full: 'Connected TV',
    note: 'Smart TVs and dongles (Roku, Fire TV, Apple TV, Chromecast) running OTT apps. Distinct from mobile / desktop because ad inventory is lean-back big-screen.',
  },

  // Streaming protocol ---------------------------------------------------
  {
    abbr: 'HLS',
    full: 'HTTP Live Streaming',
    note: "Apple's adaptive-bitrate protocol over plain HTTP. A text playlist (.m3u8) points at short MPEG-TS or fMP4 segments.",
  },
  {
    abbr: 'm3u8',
    full: 'M3U playlist (UTF-8)',
    note: 'The text manifest file format HLS uses. Two layers: a master that lists renditions, and per-rendition media playlists.',
  },
  {
    abbr: 'DASH',
    full: 'Dynamic Adaptive Streaming over HTTP',
    note: 'MPEG-standard alternative to HLS. XML manifest (.mpd) + fMP4 segments. Native on Android, web (MSE); not on iOS Safari.',
  },
  {
    abbr: 'MPEG-TS',
    full: 'MPEG Transport Stream',
    note: 'The 188-byte-packet container behind classic HLS .ts segments. Originally designed for satellite, kept by HLS for its alignment friendliness.',
  },
  {
    abbr: 'CMAF',
    full: 'Common Media Application Format',
    note: 'Fragmented-MP4 packaging shared by modern HLS and DASH so one set of segments can serve both. Replacing .ts in production deployments.',
  },
  {
    abbr: 'fMP4',
    full: 'Fragmented MP4',
    note: 'MP4 split into self-describing fragments (moof + mdat) so a player can start mid-stream. Container under CMAF.',
  },
  {
    abbr: 'JIT',
    full: 'Just-in-time packaging',
    note: 'Origin stores one high-quality mezzanine file and packages HLS / DASH renditions only when the player asks for them. Saves disk vs pre-packaging every variant; trades it for CPU on the origin.',
  },

  // Live & low-latency ---------------------------------------------------
  {
    abbr: 'LL-HLS',
    full: 'Low-Latency HLS',
    note: 'Apple\'s LL extension. Partial segments + HTTP/2 push bring glass-to-glass latency under 2 s — vs ~10–30 s for classic HLS.',
  },
  {
    abbr: 'DVR',
    full: 'Digital Video Recorder window',
    note: 'In live OTT: the manifest keeps a retention tail of old segments so the player can seek backward (rewind a goal, restart a show in progress).',
  },
  {
    abbr: 'WebRTC',
    full: 'Web Real-Time Communications',
    note: 'Sub-500 ms interactive streaming over UDP. Used for auctions, betting, two-way video. Completely different stack from HLS / DASH.',
  },
  {
    abbr: 'SCTE-35',
    full: 'Ad-cue signaling spec',
    note: 'In-band markers inside MPEG-TS streams (or sidecar metadata for CMAF) that say "ad break starts here, N seconds long". The bridge between broadcast workflows and SSAI.',
  },

  // Codec ----------------------------------------------------------------
  {
    abbr: 'codec',
    full: 'coder + decoder',
    note: 'An encoder / decoder pair that compresses and decompresses video or audio. The choice (H.264, AV1, AAC, Opus...) trades file size against decode CPU and patent licensing.',
  },
  {
    abbr: 'H.264',
    full: 'AVC — Advanced Video Coding',
    note: 'Dominant video codec for streaming. Universal hardware decode support. What FFmpeg defaults to (libx264) for this demo.',
  },
  {
    abbr: 'H.265',
    full: 'HEVC — High Efficiency Video Coding',
    note: 'Successor to H.264. ~50% smaller files at the same quality. Patent licensing is the reason adoption was slow.',
  },
  {
    abbr: 'AV1',
    full: 'AOMedia Video 1',
    note: 'Royalty-free codec from Alliance for Open Media. Similar efficiency to HEVC. Native in Chrome / Firefox; slower encode.',
  },
  {
    abbr: 'GOP',
    full: 'Group of Pictures',
    note: 'Distance between I-frames (independent keyframes). Each HLS segment must start on an I-frame, so GOP length sets the minimum segment duration.',
  },

  // Audio & localization -------------------------------------------------
  {
    abbr: 'AAC',
    full: 'Advanced Audio Coding',
    note: "MPEG-4 audio codec. The default audio for HLS — FFmpeg's aac encoder, ~128 kbps stereo for streaming. Universal hardware support.",
  },
  {
    abbr: 'AC-3 / E-AC-3',
    full: 'Dolby Digital / Dolby Digital Plus',
    note: 'Dolby\'s surround-sound codecs. E-AC-3 carries up to 7.1 + object-based metadata. Standard pass-through audio path for premium content on CTV.',
  },
  {
    abbr: 'Atmos',
    full: 'Dolby Atmos',
    note: 'Object-based immersive audio. Mixes are authored as discrete audio objects with 3D positions; the renderer maps them to the viewer\'s speaker / headphone layout at playback time.',
  },
  {
    abbr: 'Channel layout',
    full: 'Mono / Stereo / 5.1 / 7.1',
    note: 'Speaker arrangement an audio track is mixed for. Stereo (2.0) is the streaming default; 5.1 / 7.1 are surround; Atmos adds height channels and objects on top.',
  },
  {
    abbr: 'Dub',
    full: 'Dubbed audio track',
    note: 'Alternative-language voice track replacing the original. Shipped as an additional EXT-X-MEDIA TYPE=AUDIO group in the HLS master so the player can switch languages without reloading.',
  },
  {
    abbr: 'AD',
    full: 'Audio Description',
    note: 'Extra narration track describing on-screen action for blind / low-vision viewers. Required for compliance in many markets; another EXT-X-MEDIA AUDIO entry alongside the main track.',
  },

  // Ad -------------------------------------------------------------------
  {
    abbr: 'SSAI',
    full: 'Server-Side Ad Insertion',
    note: 'Backend stitches ad segments into the program manifest. Player sees one continuous stream and cannot ad-block.',
  },
  {
    abbr: 'CSAI',
    full: 'Client-Side Ad Insertion',
    note: 'Alternative pattern where the player fetches ads itself via an ad-tag. Easier to block, lower demo value — we use SSAI.',
  },
  {
    abbr: 'VAST',
    full: 'Video Ad Serving Template',
    note: 'IAB XML spec returned by the ad-server: ad creative URL, duration, impression / click-through tracking pixels.',
  },
  {
    abbr: 'VMAP',
    full: 'Video Multiple Ad Playlist',
    note: 'IAB schedule wrapper that pairs multiple VAST tags with timestamps (pre-roll at 0s, mid-rolls at 30s and 60s, etc.).',
  },
  {
    abbr: 'Roll',
    full: 'Pre-roll / Mid-roll / Post-roll',
    note: 'Ad slot positions relative to program content. This demo inserts a single pre-roll before each asset.',
  },
  {
    abbr: 'EXT-X-DATERANGE',
    full: 'HLS ad-cue tag (current)',
    note: "Apple's modern way to mark an ad block inside an HLS playlist. Carries DURATION, optional SCTE-35 attribute, arbitrary CLASS — what this demo writes for the pre-roll. Replaces the older CUE-OUT/CUE-IN pair.",
  },
  {
    abbr: 'EXT-X-CUE-OUT',
    full: 'HLS ad-cue tag (legacy)',
    note: 'Older Adobe-derived pair (CUE-OUT / CUE-IN) used by many SSAI stitchers and ad servers as a fallback for players that don\'t understand DATERANGE.',
  },

  // Security -------------------------------------------------------------
  {
    abbr: 'DRM',
    full: 'Digital Rights Management',
    note: 'Encrypted content + time-bound license. This demo uses a "DRM-lite" pattern (AES-128 HLS + HMAC-signed URLs), not Widevine / FairPlay / PlayReady.',
  },
  {
    abbr: 'AES-128',
    full: 'Advanced Encryption Standard (128-bit)',
    note: 'Symmetric cipher used to encrypt each HLS .ts segment. The player fetches the 16-byte key from the license endpoint.',
  },
  {
    abbr: 'EME',
    full: 'Encrypted Media Extensions',
    note: 'Browser W3C API that lets a player hand encrypted segments to a Content Decryption Module (CDM) — the integration point for production DRMs.',
  },
  {
    abbr: 'CENC',
    full: 'Common Encryption',
    note: 'ISO/IEC 23001-7 — a single encrypted bitstream consumable by Widevine, FairPlay (with workarounds) and PlayReady. Avoids re-encoding per platform.',
  },
  {
    abbr: 'Widevine',
    full: 'Google DRM',
    note: 'Production DRM on Chrome, Firefox, Edge, Android. Three security levels (L1 / L2 / L3); only L1 unlocks 4K.',
  },
  {
    abbr: 'FairPlay',
    full: 'Apple DRM',
    note: "Apple's DRM on Safari, iOS, tvOS. Uses HLS + SAMPLE-AES, not CENC, which is why most providers ship a parallel FairPlay path.",
  },
  {
    abbr: 'PlayReady',
    full: 'Microsoft DRM',
    note: 'DRM on Edge (legacy), Xbox, Windows, many smart-TV stacks. CENC-compatible.',
  },
  {
    abbr: 'JWT',
    full: 'JSON Web Token',
    note: 'Compact signed token used for stateless authentication. Backend issues HS256 access + refresh tokens; SPA carries them in localStorage.',
  },
  {
    abbr: 'HMAC',
    full: 'Hash-based Message Authentication Code',
    note: 'Keyed hash signature used here to make license URLs time-bound and viewer-bound — server validates the signature on every key fetch.',
  },

  // Quality, accessibility & telemetry ----------------------------------
  {
    abbr: 'WebVTT',
    full: 'Web Video Text Tracks',
    note: 'Browser-native subtitle / caption format. Wired into HLS via the master playlist\'s SUBTITLES group; into HTML5 via <track kind="subtitles">.',
  },
  {
    abbr: 'CC',
    full: 'Closed Captions (CEA-608 / CEA-708)',
    note: 'Captions encoded inside the video stream itself, not as a separate file. The legacy broadcast standard — modern OTT prefers WebVTT / TTML sidecar files, but FAST channels often still carry 608.',
  },
  {
    abbr: 'SRT',
    full: 'SubRip Text',
    note: 'Simple text caption format ([HH:MM:SS,mmm --> HH:MM:SS,mmm] + line). Universal in non-streaming workflows; not directly supported by HLS / browsers, so usually transcoded to WebVTT before delivery.',
  },
  {
    abbr: 'TTML',
    full: 'Timed Text Markup Language',
    note: 'W3C XML-based caption format with rich styling (positioning, colors, animation). Common in EBU-TT-D and IMSC1 profiles used by many studios; HLS supports it via EXT-X-MEDIA TYPE=SUBTITLES.',
  },
  {
    abbr: 'QoE',
    full: 'Quality of Experience',
    note: 'Composite metric of startup time, rebuffer ratio, average bitrate, stalls per viewer-hour. The number every CDN / encoding tweak is judged by.',
  },
  {
    abbr: 'CMCD',
    full: 'Common Media Client Data',
    note: 'CTA-5004 spec — player sends standardized telemetry (buffer level, measured throughput, content ID, session ID) in an HTTP header on every segment fetch. Lets CDN / origin observe and adapt without a separate beacon.',
  },
  {
    abbr: 'Watermark',
    full: 'Forensic watermark',
    note: 'Per-viewer identifier subtly embedded in the video itself so a leaked screen-capture can be traced back to the leaking account. Required by most major studios for premium content.',
  },

  // Tool -----------------------------------------------------------------
  {
    abbr: 'FFmpeg',
    full: 'Fast Forward MPEG',
    note: 'The open-source media toolkit the backend shells out to for transcoding raw uploads into the HLS renditions.',
  },
]

export function Glossary() {
  return (
    <dl className="glossary">
      {TERMS.map((t) => (
        <div className="glossary-row" key={t.abbr}>
          <dt>
            <span className="glossary-abbr">{t.abbr}</span>
            <span className="glossary-full">{t.full}</span>
          </dt>
          <dd>{t.note}</dd>
        </div>
      ))}
    </dl>
  )
}
