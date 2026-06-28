import { Chapter } from '../common'
import {
  GOPFramesFigure,
  CodecEfficiencyFigure,
} from '../../figures'

export const chapter: Chapter = {
  slug: 'codecs',
  title: 'Codecs',
  blurb: 'How H.264, H.265, AV1, AAC and friends turn raw frames into bits — and how to pick one.',
  render: () => (
    <>
      <p>
        A <strong>codec</strong> is an encoder + decoder pair. The encoder turns raw audio
        samples / video frames into a compressed bitstream; the decoder runs the same
        algorithm in reverse. Compression is <em>lossy</em> almost everywhere in OTT — the
        decoder reconstructs an <strong>approximation</strong> of the source. Lossless modes
        exist (FFV1, FLAC) but produce files an order of magnitude bigger, only used in
        archival.
      </p>
      <h3>How video codecs compress</h3>
      <p>
        Three classes of frame: <strong>I-frame</strong> (intra-coded, standalone like a JPEG),{' '}
        <strong>P-frame</strong> (predicted from previous I/P), <strong>B-frame</strong>{' '}
        (bidirectionally predicted from frames in both directions). A <strong>GOP</strong>{' '}
        (Group of Pictures) is the distance from one I-frame to the next; each HLS segment
        must start on an I-frame, so the GOP length sets the minimum segment duration. Inside
        a frame, the codec splits into blocks, transforms them (DCT, integer transforms),
        quantises (the lossy step), and entropy-codes the residual.
      </p>
      <div className="docs-figure">
        <GOPFramesFigure />
      </div>
      <h3>Video codecs</h3>
      <p>
        Each generation aims to shrink the file at the same visual quality (~30-50% on the
        predecessor). Adoption lags because hardware decoders catch up slowly and patent
        pools delay every transition.
      </p>
      <div className="docs-figure">
        <CodecEfficiencyFigure />
      </div>
      <table className="docs-gaps">
        <thead>
          <tr>
            <th>Codec</th>
            <th>Position</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>H.264 / AVC (2003)</td>
            <td>The streaming workhorse. Universal hardware decode (every phone, TV, browser since 2011). Licensed via MPEG LA pool but cost is amortised everywhere. What this demo uses (FFmpeg's <code>libx264</code>).</td>
          </tr>
          <tr>
            <td>H.265 / HEVC (2013)</td>
            <td>~50% smaller files than H.264 at equal quality. Required for 4K HDR on most platforms. Adoption was slow because of split patent pools (MPEG LA + HEVC Advance + Velos Media) — three separate royalty stacks.</td>
          </tr>
          <tr>
            <td>VP9 (2013)</td>
            <td>Google's royalty-free codec, similar efficiency to HEVC. Heavy use inside YouTube and Google Meet. Native in Chrome / Firefox / Android. Less hardware decode coverage outside Google's ecosystem.</td>
          </tr>
          <tr>
            <td>AV1 (2018)</td>
            <td>Alliance for Open Media's successor to VP9. ~30% smaller than HEVC, fully royalty-free. Native in Chrome, Firefox, Edge, Android 10+. Encoders (<code>libaom-av1</code>, <code>SVT-AV1</code>) are dramatically slower than x264.</td>
          </tr>
          <tr>
            <td>H.266 / VVC (2020)</td>
            <td>Next-gen MPEG codec. ~40% smaller than HEVC. Adoption blocked by yet another fragmented patent pool; very limited browser / hardware support in 2026.</td>
          </tr>
          <tr>
            <td>MPEG-2 (1995) — legacy</td>
            <td>The DVD / cable / satellite codec. Replaced everywhere by H.264 except in legacy linear broadcast streams you might still ingest from.</td>
          </tr>
        </tbody>
      </table>
      <h3>Audio codecs</h3>
      <table className="docs-gaps">
        <thead>
          <tr>
            <th>Codec</th>
            <th>Position</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>AAC (1997) — MPEG-4 Audio</td>
            <td>The streaming default. HLS expects it. Universal hardware decode. Variants: AAC-LC (the usual), HE-AAC (for low bitrates), xHE-AAC (newer, smoother loudness). What this demo uses.</td>
          </tr>
          <tr>
            <td>Opus (2012)</td>
            <td>Royalty-free, IETF-standardised. Best-in-class for both speech and music. Default for WebRTC; allowed inside CMAF + DASH. Less universal hardware support than AAC.</td>
          </tr>
          <tr>
            <td>AC-3 / E-AC-3 (1992 / 2005)</td>
            <td>Dolby Digital and Digital Plus. The surround codecs CTV apps pass through to the TV's Dolby decoder. E-AC-3 carries Atmos objects.</td>
          </tr>
          <tr>
            <td>MP3 (1993)</td>
            <td>Legacy. Universal, but worse compression than AAC at the same bitrate. Patents expired in 2017 so still appears in user-uploaded content; not used as a streaming target.</td>
          </tr>
          <tr>
            <td>FLAC (2001) — lossless</td>
            <td>Bit-exact reconstruction. Used by archival workflows and audiophile streaming tiers (Apple Music Lossless, Tidal HiFi). Files are 4–6x bigger than AAC.</td>
          </tr>
        </tbody>
      </table>
      <h3>How to pick</h3>
      <p>
        Four trade-offs always show up: <strong>compression efficiency</strong> (bytes saved at
        equal quality), <strong>decode cost</strong> (CPU / battery to play back),{' '}
        <strong>encode cost</strong> (how slow + expensive to produce), and{' '}
        <strong>licensing</strong> (patent royalties + decoder fees). In 2026 the practical
        calls look like:
      </p>
      <ul>
        <li><strong>Universal compatibility:</strong> H.264 + AAC, the path this demo takes.</li>
        <li><strong>Premium VOD targeting modern devices:</strong> dual ladder H.264 (legacy) + HEVC or AV1 (everyone else), with AAC for everything and AC-3 / E-AC-3 / Atmos for surround on CTV.</li>
        <li><strong>Pure royalty-free:</strong> AV1 + Opus inside WebM (browsers + Android) or CMAF (everyone else, once hardware lands).</li>
        <li><strong>Low latency:</strong> Opus for audio (12 ms vs AAC's 60 ms framing); H.264 or AV1 video with short GOPs.</li>
      </ul>
      <h3>What this demo uses</h3>
      <p>
        FFmpeg defaults: <code>libx264</code> for video (medium preset, single rendition for
        simplicity), <code>aac</code> for audio at ~128 kbps stereo. Output is packaged into
        MPEG-TS segments inside an HLS manifest. A production ladder would re-encode the same
        source at 360p / 480p / 720p / 1080p with keyframe-aligned GOPs and signal them in the
        master playlist.
      </p>
    </>
  ),
}
