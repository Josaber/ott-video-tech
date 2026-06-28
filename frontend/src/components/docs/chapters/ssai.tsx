import { Chapter } from '../common'
import {
  SSAISequenceFigure,
} from '../../figures'

export const chapter: Chapter = {
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
}
