interface Term {
  abbr: string
  full: string
  note: string
}

const TERMS: Term[] = [
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
    abbr: 'HLS',
    full: 'HTTP Live Streaming',
    note: "Apple's adaptive-bitrate protocol over plain HTTP. A text playlist (.m3u8) points at short MPEG-TS segments.",
  },
  {
    abbr: 'm3u8',
    full: 'M3U playlist (UTF-8)',
    note: 'The text manifest file format HLS uses. Two layers: a master that lists renditions, and per-rendition media playlists.',
  },
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
    abbr: 'JWT',
    full: 'JSON Web Token',
    note: 'Compact signed token used for stateless authentication. Backend issues HS256 access + refresh tokens; SPA carries them in localStorage.',
  },
  {
    abbr: 'HMAC',
    full: 'Hash-based Message Authentication Code',
    note: 'Keyed hash signature used here to make license URLs time-bound and viewer-bound — server validates the signature on every key fetch.',
  },
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
