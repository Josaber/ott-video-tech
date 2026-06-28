import { Chapter } from '../common'
import {
  HLSManifestFigure,
} from '../../figures'

export const chapter: Chapter = {
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
}
