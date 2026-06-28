import { Chapter } from '../common'
import {
  WatermarkingFigure,
} from '../../figures'

export const chapter: Chapter = {
  slug: 'watermarking',
  title: 'Forensic watermarking',
  blurb: 'Two flavors of watermark, where each fits, and how A/B variant stitching traces leaks.',
  render: () => (
    <>
      <p>
        DRM stops a casual download. A leaker records the screen, screen-grabs at runtime,
        or uses a stripped-down rooted player to dump decrypted segments. The video escapes
        and now sits on a piracy site. <strong>Watermarking</strong> is the technique that
        lets you trace who leaked it.
      </p>

      <h3>Two distinct things</h3>
      <table className="docs-gaps">
        <thead><tr><th></th><th>Visible watermark</th><th>Forensic watermark</th></tr></thead>
        <tbody>
          <tr>
            <td><strong>Goal</strong></td>
            <td>deter leak; signal authenticity</td>
            <td>identify leaker after leak</td>
          </tr>
          <tr>
            <td><strong>Visibility</strong></td>
            <td>visible logo / ID burned in</td>
            <td>imperceptible to viewer</td>
          </tr>
          <tr>
            <td><strong>Survives</strong></td>
            <td>re-encoding obviously; can be cropped</td>
            <td>re-encoding, screen capture, format conversion</td>
          </tr>
          <tr>
            <td><strong>Cost</strong></td>
            <td>nearly free (overlay)</td>
            <td>~5-15% extra encoding cost; vendor royalties</td>
          </tr>
          <tr>
            <td><strong>Typical use</strong></td>
            <td>screeners, pre-release reviews, B2B</td>
            <td>4K premieres, sports, enterprise</td>
          </tr>
        </tbody>
      </table>

      <h3>A/B variant stitching — how forensic watermarking actually works</h3>
      <div className="docs-figure">
        <WatermarkingFigure />
      </div>
      <ol>
        <li>
          <strong>Offline.</strong> Encode <em>two</em> watermarked variants of every
          segment — variant A and variant B. The watermark is a tiny imperceptible pattern
          (in the DCT coefficients or luminance) that survives heavy compression. A and B
          are bit-identical to the eye but mathematically distinct under a detection model.
        </li>
        <li>
          <strong>Runtime.</strong> Per playback session, the Manifest service emits a
          stitched playlist that picks A or B per segment according to a bit pattern unique
          to the session ID. For a 90-minute film at 6-second segments, that's 900 segments
          = 900 bits = enough entropy to address 2<sup>900</sup> sessions (way more than
          humans on Earth).
        </li>
        <li>
          <strong>Detection.</strong> When a leaked file shows up, run the detector against
          each segment to read off its A/B bit. Concatenate the bits → look up the
          session ID → identify the leaker.
        </li>
      </ol>

      <h3>Where it plugs into the demo's pipeline</h3>
      <p>
        The architecture doc shows watermarking in the media pipeline (offline A/B variant
        encoding) plus the Manifest service (runtime stitching). Demo-side equivalents:
      </p>
      <ul>
        <li>
          <strong>Mezzanine + transcode</strong> would emit two variants per rung instead of
          one. Storage roughly doubles per rendition; some platforms run A/B at the top rung
          only (4K) since that's the high-value leak target.
        </li>
        <li>
          <strong>Origin layout</strong> — variants share segment numbering but differ in
          URL: <code>seg-0042-A.m4s</code> / <code>seg-0042-B.m4s</code>. Origin holds both.
        </li>
        <li>
          <strong>Manifest service</strong> consults a bit pattern derived from the session ID
          (HMAC over the user / device / session for unforgeability) and emits one playlist
          referencing the chosen variant per segment.
        </li>
        <li>
          <strong>Detection service</strong> is run after a leak is found. Vendors like
          Verimatrix, NexGuard, INKA Friend offer the detection API.
        </li>
      </ul>

      <h3>Alternative: client-side stitching</h3>
      <p>
        Some implementations push the A/B selection into the player — the player has a list
        of segment URLs and a bit pattern, and picks A or B locally. Pros: no per-session
        manifest cost. Cons: the bit pattern leaks if the player is reverse-engineered;
        colluding viewers can compare their files and reconstruct the watermark.
        Server-side stitching is the default for high-value content.
      </p>

      <h3>Forensic vendors (DRMaaS overlap)</h3>
      <ul>
        <li>
          <strong>Verimatrix VideoMark / NexGuard</strong> — used by major studios; A/B variant
          encoding + detection.
        </li>
        <li>
          <strong>BuyDRM Keyflower</strong> — multi-DRM stack with forensic add-on.
        </li>
        <li>
          <strong>PallyCon Forensic Watermark</strong> — popular in APAC, cost-efficient.
        </li>
        <li>
          <strong>Friend MTS ASiD</strong> — strong sports / live focus.
        </li>
      </ul>

      <h3>Limits</h3>
      <ul>
        <li>
          Collusion attacks: multiple viewers comparing their copies can reconstruct A vs B
          on a per-segment basis. Mitigation: <strong>collusion-resistant codes</strong>
          (Tardos codes) at the cost of higher detection threshold.
        </li>
        <li>
          Cropping / resize: a 10% crop usually preserves the watermark; a 50% crop may not.
        </li>
        <li>
          Audio-only leaks: watermark is usually video-only. Audio watermarking exists
          (Aurora, Civolution) but is a separate stack.
        </li>
        <li>
          Live: low-latency live raises the bar — stitching must happen at the manifest
          cadence (every few segments) with sub-second budget.
        </li>
      </ul>
    </>
  ),
}
