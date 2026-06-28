import { Chapter } from '../common'
import {
  CDNCacheFigure,
} from '../../figures'

export const chapter: Chapter = {
  slug: 'cdn',
  title: 'CDN & delivery network',
  blurb: 'Edge cache hierarchy, multi-CDN, token signing, edge compute — what production OTT runs on.',
  render: () => (
    <>
      <p>
        Origin servers don't scale to global viewer counts. A <strong>CDN</strong> (Content
        Delivery Network) caches the manifest and segments at edge points-of-presence (PoPs)
        close to the viewer, minimising round-trip time and offloading bandwidth from the
        origin. Every production OTT system runs behind one — usually two.
      </p>
      <h3>Cache hierarchy</h3>
      <ol>
        <li><strong>Origin</strong> — your backend / packager. Single source of truth.</li>
        <li><strong>Origin shield</strong> — a single CDN PoP that wraps the origin so concurrent edge misses collapse to one origin request.</li>
        <li><strong>Tier-2 / regional PoPs</strong> — large mid-tier caches feeding edges in their region.</li>
        <li><strong>Tier-1 / edge PoPs</strong> — what viewers actually connect to. Usually hundreds globally.</li>
      </ol>
      <div className="docs-figure">
        <CDNCacheFigure />
      </div>
      <p>
        For VOD a popular asset reaches near-100% edge cache hit rate. For live the moving
        edge is harder: every viewer wants the latest segment, and the cache is cold for
        ~the segment's duration after each new segment lands.
      </p>
      <h3>Cache key design</h3>
      <ul>
        <li><strong>Per-viewer SSAI manifest.</strong> Each viewer's manifest is uniquely stitched — cache hit rate is 0% by construction. Mitigation: vendor stitchers emit a manifest cache key that strips per-viewer URLs so the rest is shareable.</li>
        <li><strong>Signed-URL query strings.</strong> If the signature lives in the query and the CDN keys on full URL, every signed-URL refresh misses cache. Strip the signature from the cache key.</li>
      </ul>
      <h3>Multi-CDN strategy</h3>
      <p>
        Single-CDN is single-point-of-failure plus single-point-of-pricing. Multi-CDN systems
        route per-session based on real-time signals: throughput from the player (CMCD),
        latency probes, regional outages, current cost tier. <strong>Conviva</strong> and{' '}
        <strong>NPAW</strong> both sell this. The router emits a different CDN host in the
        session's manifest URL.
      </p>
      <h3>Edge compute</h3>
      <p>
        Modern CDNs run small workers at the edge — <strong>CloudFront Functions</strong>,{' '}
        <strong>Lambda@Edge</strong>, <strong>Akamai EdgeWorkers</strong>,{' '}
        <strong>Fastly Compute</strong>. Useful in OTT for:
      </p>
      <ul>
        <li>Token rewrite — refresh a signed URL on hit without round-tripping to origin.</li>
        <li>Geo redirect — route an EU viewer to an EU origin.</li>
        <li>Manifest manipulation — inject per-viewer watermark IDs, strip ad cues for live.</li>
        <li>SSAI itself — vendor-managed ad insertion at the edge.</li>
      </ul>
      <h3>Token-signed URLs</h3>
      <p>
        CloudFront / Akamai / Fastly all support edge-validated signed URLs. The signature
        encodes expiry + optionally IP + path; the CDN validates at edge before serving.
        Two delivery modes: query-string signature (every URL signed) or signed cookies
        (one cookie covers many URLs under a path).
      </p>
      <h3>Cost</h3>
      <p>
        CDN egress dominates streaming P&amp;L. Order of magnitude in 2026:
      </p>
      <ul>
        <li>AWS CloudFront: $0.085/GB at low volume, ~$0.02/GB negotiated at scale.</li>
        <li>Cloudflare: $0 egress on R2 → Bandwidth Alliance partners.</li>
        <li>Akamai / Fastly: enterprise-quoted, typically $0.005–0.02/GB at OTT scale.</li>
      </ul>
      <p>
        A 5 Mbps stream is ~2.25 GB/hr. One million viewer-hours at $0.02/GB = $45,000.
        That's why cache hit rate, codec efficiency and ABR ladder design directly translate
        to operating margin.
      </p>
      <h3>What this demo does</h3>
      <p>
        Backend serves segments directly to the browser. No CDN, no edge cache, no signed-URL
        complexity. Fine for one viewer on localhost; falls over at the first thousand-viewer
        spike.
      </p>
    </>
  ),
}
