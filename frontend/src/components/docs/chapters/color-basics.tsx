import { Chapter } from '../common'
import {
  GamutFigure,
} from '../../figures'

export const chapter: Chapter = {
  slug: 'color-basics',
  title: 'Color, light & vision',
  blurb: 'Color spaces, gamut, gamma, HDR transfer functions — what video pixels actually carry.',
  render: () => (
    <>
      <p>
        Other chapters mention BT.709, BT.2020, PQ, HLG without pinning down what they mean.
        This chapter is the perception side: how human vision works, and how digital video
        encodes the result.
      </p>

      <h3>Light and the human eye</h3>
      <p>
        Visible light is electromagnetic radiation from ~380 nm (deep violet) to ~700 nm
        (deep red). The retina has two receptor types:
      </p>
      <ul>
        <li><strong>Rods</strong> — sensitive to brightness, no color, used in dim light.</li>
        <li><strong>Cones</strong> — three types, sensitive to roughly red / green / blue light. Vision is more sensitive to green (peak ~555 nm).</li>
      </ul>
      <p>
        Most video pipelines model color as combinations of red / green / blue stimuli
        matching cone responses. CIE in 1931 codified this as <strong>CIE XYZ</strong>, the
        absolute reference every other color space sits on top of.
      </p>

      <h3>Color space and gamut</h3>
      <p>
        A <strong>color space</strong> picks three primary colors (R, G, B) and a white
        point, then defines all reproducible colors as combinations of those primaries. The
        set of reachable colors is the <strong>gamut</strong>.
      </p>
      <div className="docs-figure">
        <GamutFigure />
      </div>
      <table className="docs-gaps">
        <thead><tr><th>Space</th><th>Where</th></tr></thead>
        <tbody>
          <tr><td><strong>sRGB</strong></td><td>1996. Web standard. Matches what consumer monitors of the late '90s could display.</td></tr>
          <tr><td><strong>BT.709</strong></td><td>HD SDR — TV, Blu-ray, modern streaming. Almost identical primaries to sRGB but a different transfer function.</td></tr>
          <tr><td><strong>DCI-P3</strong></td><td>Cinema and modern mobile / desktop displays (Apple Display P3). ~25% wider gamut than BT.709.</td></tr>
          <tr><td><strong>BT.2020</strong></td><td>UHD / HDR — 4K HDR streaming, Dolby Vision, HDR10. ~75% of visible colors. No current consumer display covers it fully.</td></tr>
          <tr><td><strong>ACES</strong></td><td>Academy Color Encoding System. Production mastering. Covers all visible colors with headroom.</td></tr>
        </tbody>
      </table>

      <h3>Gamma / transfer function</h3>
      <p>
        Doubling a pixel's stored value does NOT double the displayed brightness. The eye
        responds non-linearly to luminance — it's much more sensitive to small differences
        in dark areas than in bright ones. The <strong>transfer function</strong> (often
        called <strong>gamma</strong>) encodes light into pixel values along a curve that
        puts more codes where the eye can see them.
      </p>
      <p>
        SDR uses a power-curve gamma (~2.2 in sRGB, ~2.4 in BT.709). HDR introduces two new
        transfer functions:
      </p>
      <ul>
        <li><strong>PQ</strong> (Perceptual Quantizer, SMPTE ST 2084) — absolute brightness reference, peak 10,000 nits. Each code value maps to a specific cd/m². Used by HDR10 and Dolby Vision.</li>
        <li><strong>HLG</strong> (Hybrid Log-Gamma, BBC + NHK) — relative brightness, backwards-compatible with SDR displays. Used by live broadcast HDR.</li>
      </ul>

      <h3>White point</h3>
      <p>
        The "neutral" white of a color space. Most modern video uses <strong>D65</strong>{' '}
        (6504 K — overcast daylight). Cinema uses <strong>D55</strong> or the slightly
        warmer <strong>DCI</strong> white. A mismatch makes whites look tinted blue or
        yellow.
      </p>

      <h3>Bit depth and banding</h3>
      <p>
        8 bits per channel = 256 levels. In a smooth dark-to-light sky, the steps between
        levels become visible as <strong>banding</strong>. HDR extends brightness range
        ~100×, which would make 8-bit banding much worse, so HDR mandates 10-bit (1024
        levels) at minimum.
      </p>

      <h3>What it means for the codec</h3>
      <p>
        A codec stream is a triple: <em>gamut + transfer function + bit depth</em>. An
        HDR10 stream is "BT.2020 primaries + PQ transfer + 10-bit per channel". The decoder
        needs to know all three to map pixel values back to the correct light. The HEVC
        bitstream carries them in metadata (color primaries / transfer characteristics /
        matrix coefficients fields).
      </p>
    </>
  ),
}
