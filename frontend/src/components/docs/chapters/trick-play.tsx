import { Chapter } from '../common'
import {
  TrickPlayFigure,
} from '../../figures'

export const chapter: Chapter = {
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
}
