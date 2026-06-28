import { Group } from './glossary.types'

export const GROUPS_OPS: Group[] = [
  {
    label: 'Ad pipeline',
    items: [
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
        note: "Older Adobe-derived pair (CUE-OUT / CUE-IN) used by many SSAI stitchers and ad servers as a fallback for players that don't understand DATERANGE.",
      },
    ],
  },
  {
    label: 'Security & DRM',
    items: [
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
    ],
  },
  {
    label: 'Captions & accessibility',
    items: [
      {
        abbr: 'WebVTT',
        full: 'Web Video Text Tracks',
        note: "Browser-native subtitle / caption format. Wired into HLS via the master playlist's SUBTITLES group; into HTML5 via <track kind=\"subtitles\">.",
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
    ],
  },
  {
    label: 'Quality & telemetry',
    items: [
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
    ],
  },
  {
    label: 'Toolchain',
    items: [
      {
        abbr: 'FFmpeg',
        full: 'Fast Forward MPEG',
        note: 'The open-source media toolkit the backend shells out to for transcoding raw uploads into the HLS renditions.',
      },
    ],
  },
]
