import { Chapter } from '../common'
import {
  ChromaSubsamplingFigure,
} from '../../figures'

export const chapter: Chapter = {
  slug: 'video-basics',
  title: 'Video fundamentals',
  blurb: 'Pixels, frame rate, scan modes, chroma subsampling — what video codecs operate on.',
  render: () => (
    <>
      <p>
        Codec chapters talk about encoding "1080p at 5 Mbps" without spelling out what the
        bitstream represents. This chapter is the layer below: how a moving image becomes a
        grid of numbers per frame.
      </p>

      <h3>Image = pixel grid</h3>
      <p>
        Every frame is a 2D grid of <strong>pixels</strong> ("picture elements"), each
        carrying a color. The grid size is the <strong>resolution</strong>.
      </p>
      <table className="docs-gaps">
        <thead><tr><th>Common resolution</th><th>Pixels</th></tr></thead>
        <tbody>
          <tr><td>480p (SD)</td><td>854 × 480 ≈ 0.4 MP</td></tr>
          <tr><td>720p (HD)</td><td>1280 × 720 ≈ 0.9 MP</td></tr>
          <tr><td>1080p (Full HD)</td><td>1920 × 1080 ≈ 2.1 MP</td></tr>
          <tr><td>4K UHD</td><td>3840 × 2160 ≈ 8.3 MP</td></tr>
          <tr><td>8K</td><td>7680 × 4320 ≈ 33.2 MP</td></tr>
        </tbody>
      </table>

      <h3>Aspect ratio</h3>
      <p>
        Width-to-height ratio of the frame. Common shapes:
      </p>
      <ul>
        <li><strong>16:9</strong> — modern TV + nearly all OTT.</li>
        <li><strong>21:9</strong> — ultrawide cinema / IMAX. Letterboxed on 16:9 displays.</li>
        <li><strong>4:3</strong> — pre-2003 TV. Mostly archival now.</li>
        <li><strong>9:16</strong> — vertical (TikTok / Stories / Shorts). Mobile-first content.</li>
        <li><strong>1:1</strong> — square. Social previews.</li>
      </ul>

      <h3>Frame rate</h3>
      <p>
        Frames per second. The eye fuses ~24+ fps into smooth motion; higher rates feel
        more "real".
      </p>
      <table className="docs-gaps">
        <thead><tr><th>fps</th><th>Used for</th></tr></thead>
        <tbody>
          <tr><td>24</td><td>Cinema. The "film look".</td></tr>
          <tr><td>25 / 50</td><td>PAL broadcast (Europe).</td></tr>
          <tr><td>29.97 / 59.94</td><td>NTSC broadcast (US). The fractional rate is a 1953 hack to fit color into the same spectrum as B&W.</td></tr>
          <tr><td>30 / 60</td><td>Web video, mobile recording defaults.</td></tr>
          <tr><td>120 / 240</td><td>Sports broadcast, high-end gaming, slow-motion source.</td></tr>
        </tbody>
      </table>

      <h3>Progressive vs interlaced</h3>
      <p>
        Old broadcast (1080i) sent every other line per field — odd lines first, even lines
        next, two fields per frame. Modern delivery is universally <strong>progressive</strong>:
        every line of every frame, in order. Interlaced source is de-interlaced before encode.
      </p>

      <h3>RGB vs YUV (luma + chroma)</h3>
      <p>
        Display hardware uses red / green / blue per pixel. Codecs work in <strong>YUV</strong>
        {' '}instead:
      </p>
      <ul>
        <li><strong>Y</strong> (luma) — brightness, the part the eye is most sensitive to.</li>
        <li><strong>U</strong> and <strong>V</strong> (chroma) — color information.</li>
      </ul>
      <p>
        Separating brightness from color lets the codec exploit a key fact: the eye is much
        less sensitive to fine color detail than to fine brightness detail.
      </p>

      <h3>Chroma subsampling</h3>
      <p>
        Codecs store luma at full resolution but downsample chroma. Three standard ratios:
      </p>
      <div className="docs-figure">
        <ChromaSubsamplingFigure />
      </div>
      <ul>
        <li><strong>4:4:4</strong> — full chroma. Mastering and graphics.</li>
        <li><strong>4:2:2</strong> — chroma at half horizontal resolution. Broadcast / professional.</li>
        <li><strong>4:2:0</strong> — chroma at half horizontal AND vertical. Streaming default. ½ the chroma data, ~no perceptual loss on most content.</li>
      </ul>

      <h3>Bit depth per channel</h3>
      <p>
        8-bit (256 levels per channel) is the SDR streaming default. HDR pipelines need{' '}
        <strong>10-bit</strong> (1024 levels) to avoid banding in dark gradients. 12-bit
        appears in some mastering and Dolby Vision flows.
      </p>
    </>
  ),
}
