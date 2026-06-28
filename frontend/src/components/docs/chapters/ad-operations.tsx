import { Chapter, L } from '../common'
import {
  AdAuctionFigure,
} from '../../figures'

export const chapter: Chapter = {
  slug: 'ad-operations',
  title: 'Ad operations & monetization',
  blurb: 'Past the technical SSAI plumbing — CPM, fill rate, deal types, auction topology.',
  render: () => (
    <>
      <p>
        The <L slug="ssai">SSAI chapter</L> covers <em>how</em> ads get into the stream.
        This chapter covers <em>why</em> a particular ad ends up in a particular slot —
        the business plumbing that decides which ad wins, what it pays, and how the
        publisher gets credit.
      </p>

      <h3>Pricing models</h3>
      <table className="docs-gaps">
        <thead><tr><th>Model</th><th>What advertiser pays for</th><th>Typical OTT CPM</th></tr></thead>
        <tbody>
          <tr><td><strong>CPM</strong> (cost per mille)</td><td>1000 impressions delivered</td><td>$15-$40 US OTT premium</td></tr>
          <tr><td><strong>CPCV</strong> (cost per completed view)</td><td>impression watched to ≥95%</td><td>$25-$60 (premium video)</td></tr>
          <tr><td><strong>CPC</strong> (cost per click)</td><td>click on companion / overlay</td><td>$0.50-$5 (rare in video)</td></tr>
          <tr><td><strong>CPA</strong> (cost per action)</td><td>signup / purchase</td><td>$5-$50 (direct-response)</td></tr>
          <tr><td><strong>Flat rate</strong></td><td>guaranteed campaign delivery</td><td>negotiated</td></tr>
        </tbody>
      </table>
      <p>
        OTT is dominated by CPM and CPCV. CPCV is preferred by brand advertisers because it
        aligns spend with engagement (the user actually watched). For the publisher, eCPM
        (effective CPM = total revenue / impressions × 1000) is the single number to track.
      </p>

      <h3>Fill rate</h3>
      <p>
        The percentage of ad opportunities that get filled with a paying ad.
      </p>
      <ul>
        <li>
          <strong>Premium fill rate</strong>: % filled at the publisher's floor price.
          Healthy is 70-90%.
        </li>
        <li>
          <strong>Total fill rate (including house ads / remnant)</strong>: should be 100%
          — every slot must show <em>something</em>. House fills with promos, charity PSAs,
          or low-CPM remnant networks.
        </li>
        <li>
          <strong>Unfilled = ad-service "no-fill" response.</strong> The SSAI stitcher must
          handle this by either skipping the break (HLS gap, easier said than done) or
          inserting a house creative.
        </li>
      </ul>

      <h3>Deal types</h3>
      <table className="docs-gaps">
        <thead><tr><th>Type</th><th>How it works</th><th>Where it fits</th></tr></thead>
        <tbody>
          <tr>
            <td><strong>Direct / IO</strong></td>
            <td>publisher and advertiser sign an Insertion Order; guaranteed delivery</td>
            <td>premium upfront commitments</td>
          </tr>
          <tr>
            <td><strong>PG</strong> (Programmatic Guaranteed)</td>
            <td>guaranteed CPM and volume, delivered programmatically via DSP/SSP</td>
            <td>large advertisers wanting automation</td>
          </tr>
          <tr>
            <td><strong>PMP</strong> (Private Marketplace)</td>
            <td>invite-only auction with curated buyers; floor price per deal ID</td>
            <td>premium publishers who want auction efficiency without open exchange</td>
          </tr>
          <tr>
            <td><strong>Open exchange (OMP)</strong></td>
            <td>real-time bidding among any DSPs that subscribe</td>
            <td>backfill / remnant; lowest CPMs but highest fill</td>
          </tr>
        </tbody>
      </table>
      <p>
        A real publisher runs all four in priority order: direct/PG fills first, then PMP,
        then open exchange, then house ads.
      </p>

      <h3>Auction topology — waterfall vs unified</h3>
      <div className="docs-figure">
        <AdAuctionFigure />
      </div>
      <p>
        <strong>Waterfall</strong>: query DSPs sequentially in a fixed priority. First DSP
        that bids above the floor wins. Easy to implement; loses revenue because higher
        bidders further down the chain are never queried.
      </p>
      <p>
        <strong>Unified auction</strong> (a.k.a. header bidding for video, prebid wrapper,
        server-side header bidding): query all DSPs in parallel and pick the highest bid.
        Modern standard. Typical revenue uplift versus waterfall: 20-30%. The catch is
        latency — every bidder must respond inside the same window (~150-200 ms for video),
        so timeouts are aggressive.
      </p>

      <h3>Brand safety / suitability</h3>
      <p>
        A car ad next to a graphic news clip is bad for both sides. Brand suitability is the
        set of rules that prevents this:
      </p>
      <ul>
        <li>
          <strong>IAB Content Taxonomy</strong> classifies the program (genre, themes, tone).
        </li>
        <li>
          <strong>Page-level signals</strong> from the metadata layer flag a program's
          rating, themes, advisories.
        </li>
        <li>
          <strong>Advertiser filters</strong> say "no news, no horror, no shows with adult
          language". The ad-server enforces this before allowing a bid.
        </li>
        <li>
          <strong>Brand-safety scanners</strong> (DoubleVerify, Integral Ad Science) score
          inventory in real time and provide post-buy reports.
        </li>
      </ul>

      <h3>Frequency caps</h3>
      <ul>
        <li>
          <strong>Per-user</strong>: a single creative may show at most N times per day /
          week / campaign. Bedrock for not annoying viewers.
        </li>
        <li>
          <strong>Per-pod</strong>: don't show two ads from the same advertiser in the same
          break.
        </li>
        <li>
          <strong>Competitive separation</strong>: don't show Pepsi right after Coke.
        </li>
        <li>
          <strong>State (across devices)</strong>: frequency is per user-identity, not
          per-device. Requires user identity to carry across phone / TV / web (cookies are
          useless on TV). Hence the rise of identity solutions (ID5, RampID, UID 2.0).
        </li>
      </ul>

      <h3>Attribution</h3>
      <p>
        Did the ad work? Three approaches:
      </p>
      <ul>
        <li>
          <strong>Last-touch click attribution</strong> — only useful for direct-response.
        </li>
        <li>
          <strong>View-through attribution</strong> — if user signed up within N days of
          seeing the ad, credit the ad. Standard for brand video.
        </li>
        <li>
          <strong>Incrementality testing</strong> — randomized holdouts measure lift over
          no-ad control. Methodologically the only attribution that survives scrutiny;
          adoption growing fast.
        </li>
      </ul>

      <h3>What this demo doesn't model</h3>
      <p>
        The demo's ad-service serves a single hard-coded pre-roll, no auction. Real
        monetization stacks layer SSP / DSP / DMP / identity providers in front of the SSAI
        stitcher. The technical splice is the easy bit — the auction and attribution layer
        is where the revenue happens.
      </p>
    </>
  ),
}
