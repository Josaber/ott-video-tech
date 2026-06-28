import { Chapter } from '../common'
import {
  ABRLadderFigure,
} from '../../figures'

export const chapter: Chapter = {
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
        a specific resolution and bitrate. The set of renditions you offer is the production
        {' '}<strong>ABR ladder</strong>:
      </p>
      <div className="docs-figure">
        <ABRLadderFigure />
      </div>
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
}
