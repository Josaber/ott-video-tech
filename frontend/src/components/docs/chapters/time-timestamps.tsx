import { Chapter } from '../common'
import {
  PtsDtsFigure,
} from '../../figures'

export const chapter: Chapter = {
  slug: 'time-timestamps',
  title: 'Time, clocks & timestamps',
  blurb: 'PTS, DTS, media time vs wall clock, A/V sync, the live edge.',
  render: () => (
    <>
      <p>
        Almost every later chapter — SSAI, Live, Trick-play, Manifest deep-dive — assumes
        a time model the reader already understands. This chapter is that model: how
        decoders track media time, how that maps to the viewer's wall clock, and why A/V
        sync is a real engineering problem.
      </p>

      <h3>The 90 kHz clock</h3>
      <p>
        MPEG decided in 1993 that media time would tick at <strong>90,000 Hz</strong>. Every
        sample, every frame, every audio packet carries a timestamp in these units. 90 kHz
        is divisible by every common video frame rate (24, 25, 30, 60) and audio sample rate
        (8, 16, 32, 48 kHz). One tick ≈ 11.1 µs.
      </p>
      <p>
        ISO BMFF / CMAF use a flexible per-track <code>timescale</code> instead of a fixed
        90 kHz. The principle is the same: every timestamp is in ticks of the track's clock.
      </p>

      <h3>PTS vs DTS — decode order ≠ display order</h3>
      <p>
        B-frames (covered in <em>Codecs</em>) are predicted from BOTH past and future I/P
        frames. So the decoder needs the future frame BEFORE it can render the B-frame in
        between. Decode and display orders are different:
      </p>
      <div className="docs-figure">
        <PtsDtsFigure />
      </div>
      <ul>
        <li><strong>DTS</strong> (Decoding Timestamp) — when this frame should be handed to the decoder.</li>
        <li><strong>PTS</strong> (Presentation Timestamp) — when the decoded frame should be displayed.</li>
      </ul>
      <p>
        For an I- or P-frame, DTS = PTS. For a B-frame, PTS &gt; DTS — the decoder
        receives the frame earlier than it's shown. Container formats (MP4, MPEG-TS, CMAF)
        carry both timestamps per sample.
      </p>

      <h3>Media time vs wall-clock time</h3>
      <p>
        <strong>Media time</strong> starts at 0 at the beginning of the program. The seek
        bar reads media time. VOD only ever needs this.
      </p>
      <p>
        <strong>Wall-clock time</strong> is the real-world time. Live streaming needs it to
        answer "how stale am I vs the live edge?" and "what time is it on the air?"
      </p>
      <p>
        HLS anchors the two with <code>#EXT-X-PROGRAM-DATE-TIME</code> on a live media
        playlist:
      </p>
      <pre><code>{`#EXT-X-PROGRAM-DATE-TIME:2026-06-19T14:30:00Z
#EXTINF:4.000,
segment_8123.ts`}</code></pre>
      <p>
        Every later segment's wall-clock time = anchor + cumulative media duration. DASH
        uses <code>availabilityStartTime</code> on the MPD root and{' '}
        <code>presentationTimeOffset</code> per period for the same purpose.
      </p>

      <h3>PCR — TS-level synchronisation</h3>
      <p>
        MPEG Transport Stream (.ts) carries a <strong>Program Clock Reference</strong> at
        the packet level, embedded periodically in the elementary stream. The decoder uses
        PCR to re-derive its local 90 kHz clock from the wire — it's how the receiver stays
        synchronised with the encoder despite network jitter. CMAF doesn't have PCR; the
        player relies on segment boundaries + the manifest timeline.
      </p>

      <h3>A/V sync</h3>
      <p>
        Video and audio are decoded by independent paths inside the player. Each has its
        own clock derived from PTS. Modern decoders run a slave-master sync loop: audio is
        usually the master (a glitch is more annoying than a hiccup), video adjusts to
        match by dropping or repeating frames.
      </p>
      <p>
        Tolerance: lipsync that lags by more than ~45 ms is detectable; more than ~125 ms
        is actively distracting. ATSC A/85 and ITU-R BT.1359 specify these thresholds.
      </p>

      <h3>The live edge</h3>
      <p>
        The <strong>live edge</strong> is the most recent segment available. The player's
        distance from the edge is the latency budget covered in <em>Live streaming pipeline</em>.
        A player at the edge sees the encoder's most-recent output; a player in DVR mode
        sees an older segment from the retention window.
      </p>

      <h3>Time-shift and DVR window</h3>
      <p>
        Live HLS keeps the last N segments in the manifest (sliding window). The retention
        tail is the <strong>DVR window</strong> — pause, scrub-back and restart-from-the-top
        all key off how far back PROGRAM-DATE-TIME reaches. Real OTT live keeps anywhere
        from 30 min (sports) to 7 days (catch-up TV) of DVR.
      </p>

      <h3>Edge cases</h3>
      <ul>
        <li><strong>Clock drift across encoders.</strong> Multi-camera live ingests must NTP-sync within ms; otherwise inter-cam switching glitches.</li>
        <li><strong>Daylight saving.</strong> PROGRAM-DATE-TIME is always UTC. Frontend converts to viewer-local for display.</li>
        <li><strong>Leap seconds.</strong> Most pipelines use UTC-SLS or smear the leap second to avoid 23:59:60. ESPN famously dropped a frame in 2008.</li>
      </ul>
    </>
  ),
}
