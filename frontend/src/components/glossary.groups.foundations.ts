import { Group } from './glossary.types'

export const GROUPS_FOUNDATIONS: Group[] = [
  {
    label: 'Domain',
    items: [
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
    ],
  },
  {
    label: 'Distribution & monetization',
    items: [
      {
        abbr: 'Live',
        full: 'Live streaming',
        note: 'Encoder feeds fresh segments while viewers watch. Manifest is a sliding window. Latency and DVR rules matter; pre-encoded VOD has neither.',
      },
      {
        abbr: 'Linear',
        full: 'Linear (channel) programming',
        note: "Scheduled programming on a fixed channel — broadcast TV's native pattern, replicated on OTT for FAST channels and 24/7 news / sports.",
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
        note: "Free for the viewer; revenue is ad impressions. YouTube's free tier, Pluto TV on-demand, Tubi.",
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
    ],
  },
  {
    label: 'Streaming protocol & packaging',
    items: [
      {
        abbr: 'HLS',
        full: 'HTTP Live Streaming',
        note: "Apple's adaptive-bitrate protocol over plain HTTP. A text playlist (.m3u8) points at short MPEG-TS or fMP4 segments.",
      },
      {
        abbr: 'Manifest',
        full: 'playlist / MPD — the index file',
        note: "The first file a streaming player loads. Lists renditions, bitrates and pointers to every segment. HLS uses a text playlist (.m3u8) in two layers — a master listing per-bitrate media playlists. DASH uses an XML manifest (.mpd, Media Presentation Description) with a Period → AdaptationSet → Representation → Segment hierarchy. CMAF is NOT a manifest format — it's the segment container under both, so modern HLS and DASH can point at the same .m4s files through their own manifests.",
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
    ],
  },
  {
    label: 'Live & low-latency',
    items: [
      {
        abbr: 'LL-HLS',
        full: 'Low-Latency HLS',
        note: "Apple's LL extension. Partial segments + HTTP/2 push bring glass-to-glass latency under 2 s — vs ~10–30 s for classic HLS.",
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
    ],
  },
  {
    label: 'Video codec',
    items: [
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
      {
        abbr: 'HDR10',
        full: 'Open HDR baseline',
        note: 'High-dynamic-range with static, whole-stream metadata (peak luminance, color volume). Royalty-free baseline every HDR-capable TV supports. Carried over HEVC 10-bit.',
      },
      {
        abbr: 'Dolby Vision',
        full: 'HDR with dynamic metadata',
        note: "Per-scene (or per-frame) tone-mapping metadata layered on top of an HEVC HDR base. Wider gamut and finer brightness control than HDR10's static metadata. Premium-OTT tier alongside Atmos.",
      },
    ],
  },
  {
    label: 'Audio & localization',
    items: [
      {
        abbr: 'AAC',
        full: 'Advanced Audio Coding',
        note: "MPEG-4 audio codec. The default audio for HLS — FFmpeg's aac encoder, ~128 kbps stereo for streaming. Universal hardware support.",
      },
      {
        abbr: 'Stereo',
        full: '2-channel audio (2.0)',
        note: 'Left + Right speakers. The default streaming audio layout — every decoder handles it; a phone speaker folds down to mono from the same bitstream.',
      },
      {
        abbr: 'Channel layout',
        full: 'Mono / Stereo / 5.1 / 7.1',
        note: 'Speaker arrangement an audio track is mixed for. Stereo (2.0) is the streaming default; 5.1 / 7.1 are surround; Atmos adds height channels and objects on top.',
      },
      {
        abbr: 'Dolby',
        full: 'Dolby Laboratories portfolio',
        note: 'Umbrella brand for premium A/V tech across OTT: audio (Dolby Digital AC-3, Digital Plus E-AC-3, Atmos object-based) and video / HDR (Dolby Vision). Licensed decoders + certification programs across every CTV and silicon vendor.',
      },
      {
        abbr: 'AC-3 / E-AC-3',
        full: 'Dolby Digital / Dolby Digital Plus',
        note: "Dolby's surround-sound codecs. E-AC-3 carries up to 7.1 + object-based metadata. Standard pass-through audio path for premium content on CTV.",
      },
      {
        abbr: 'Atmos',
        full: 'Dolby Atmos',
        note: "Object-based immersive audio. Mixes are authored as discrete audio objects with 3D positions; the renderer maps them to the viewer's speaker / headphone layout at playback time.",
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
    ],
  },
]
