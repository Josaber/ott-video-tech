import { Chapter } from '../common'
import {
  CostBreakdownFigure,
} from '../../figures'

export const chapter: Chapter = {
  slug: 'cost',
  title: 'Cost model',
  blurb: 'Where the dollars go: CDN egress, encoding, storage, DRM, content acquisition.',
  render: () => (
    <>
      <p>
        OTT P&amp;L is dominated by a few line items that scale linearly with viewer hours.
        Understanding the breakdown is what turns "should we do AV1?" from a tech question
        into a financial one.
      </p>
      <h3>The big four (2026 order of magnitude)</h3>
      <table className="docs-gaps">
        <thead><tr><th>Line</th><th>Cost range</th></tr></thead>
        <tbody>
          <tr><td>CDN egress</td><td>$0.005-0.085 / GB. Negotiated heavily at scale. By far the dominant variable cost.</td></tr>
          <tr><td>Encoding (cloud)</td><td>$0.015-0.075 / output minute (AWS MediaConvert, Mux). Per-rendition.</td></tr>
          <tr><td>Storage</td><td>$0.023 / GB-month S3 Standard, $0.0125 Infrequent Access, $0.004 Glacier. Catalog tier to IA after first 90 days.</td></tr>
          <tr><td>DRM license issuance</td><td>$0.0001-0.001 / license. Free for hobbyist scale; enterprise contracts at low fractions of a cent.</td></tr>
        </tbody>
      </table>
      <h3>Per viewer-hour breakdown</h3>
      <div className="docs-figure">
        <CostBreakdownFigure />
      </div>
      <h3>Worked example</h3>
      <p>1 million viewer-hours of a 5 Mbps stream:</p>
      <ul>
        <li>Bits delivered: 5 Mbps × 3600 s × 1M ≈ 2.25 PB</li>
        <li>At $0.02/GB CDN: 2.25M GB × $0.02 = <strong>$45,000</strong></li>
        <li>At $0.005/GB (top-tier negotiated): <strong>$11,250</strong></li>
      </ul>
      <p>
        Per viewer-hour: ~4.5 cents at $0.02/GB. That's the cost a SVOD subscription must
        cover — and then content acquisition, marketing, payments, customer support, profit.
      </p>
      <h3>Hardware vs cloud encoding</h3>
      <p>
        Cloud encoding billed per minute is convenient but ~10× the marginal cost of a colo'd
        GPU. NVENC on a $300/mo NVIDIA L4 can encode ~8 simultaneous H.264 4K @ 60 FPS
        streams. Once you're transcoding more than ~100 hours/day you save by going on-prem
        or spot-instance GPU.
      </p>
      <h3>Non-linear costs</h3>
      <ul>
        <li><strong>Captioning</strong> — manual transcription: $1-5/min. ML transcription + human review: $0.20-1/min.</li>
        <li><strong>Audio description</strong> — narrated by voice actors: $3-10/min.</li>
        <li><strong>QC</strong> — automated tools $$, manual review $$$. Reject rate &gt; 50% on first studio submissions is normal.</li>
        <li><strong>Per-title encoding</strong> — Netflix-style analysis: extra $0.05-0.20 / output minute, saves 5-30% bitrate at equal quality.</li>
        <li><strong>Original mastering</strong> — the production cost. Tentpole movie: $100M+. Episodic series: $1-15M/episode. Dwarfs everything above.</li>
      </ul>
      <h3>Levers</h3>
      <ul>
        <li><strong>Cache hit rate.</strong> A 99% cache hit means the CDN charges the 99% rate; the 1% origin egress is your real cost.</li>
        <li><strong>Codec efficiency.</strong> AV1 vs H.264 saves ~30% bytes at equal quality → 30% off the egress bill at the cost of encode time.</li>
        <li><strong>ABR ladder depth.</strong> Each rendition multiplies storage + encoding cost. Drop the highest tier if your viewer mix is mostly mobile.</li>
      </ul>
    </>
  ),
}
