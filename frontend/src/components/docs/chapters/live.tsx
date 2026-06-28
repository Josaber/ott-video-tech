import { Chapter } from '../common'
import {
  LiveLatencyFigure,
} from '../../figures'

export const chapter: Chapter = {
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
}
