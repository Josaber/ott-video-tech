import { Chapter } from '../common'
import {
  QoeTelemetryFigure,
} from '../../figures'

export const chapter: Chapter = {
  slug: 'observability',
  title: 'Observability & QoE',
  blurb: "How to know whether your viewers are happy — and which tweak made it better.",
  render: () => (
    <>
      <p>
        Streaming quality is the product. <strong>QoE</strong> (Quality of Experience) is the
        composite metric every encoding, packaging, CDN and player change is judged on.
        Operators monitor it in real time and slice it by every dimension that could explain
        regressions.
      </p>
      <h3>Core metrics</h3>
      <table className="docs-gaps">
        <thead><tr><th>Metric</th><th>Definition</th></tr></thead>
        <tbody>
          <tr><td>Startup time</td><td>From "play tapped" to "first frame on screen". Target: &lt; 2 s.</td></tr>
          <tr><td>Video Start Failure (VSF)</td><td>% of play attempts that never produced a first frame. Target: &lt; 1%.</td></tr>
          <tr><td>Exit Before Video Start (EBVS)</td><td>User gave up before VSF determined. Bundled with startup time tuning.</td></tr>
          <tr><td>Rebuffer ratio</td><td>Time stalled during play / total play time. Target: &lt; 0.5%.</td></tr>
          <tr><td>Average bitrate</td><td>Mean rendition selected. Higher = nicer picture, lower = less data risk.</td></tr>
          <tr><td>Bitrate switches / min</td><td>How often ABR oscillates. High = unstable connection or bad ABR algo.</td></tr>
          <tr><td>Video Playback Failure (VPF)</td><td>Started but errored mid-stream.</td></tr>
          <tr><td>Concurrent viewers</td><td>Capacity-planning input. Real-time + historical for autoscaling.</td></tr>
        </tbody>
      </table>
      <h3>Vendors</h3>
      <ul>
        <li><strong>Conviva</strong> — analytics + real-time multi-CDN switching. Industry de-facto.</li>
        <li><strong>Mux Data</strong> — modern API-first. Pairs with Mux Video JIT packaging.</li>
        <li><strong>Bitmovin Analytics</strong> — bundled with Bitmovin player.</li>
        <li><strong>NPAW (YOUBORA)</strong> — broadcaster favourite, European stronghold.</li>
        <li><strong>Datazoom</strong> — collector layer; pipes events to any backend.</li>
      </ul>
      <h3>How instrumentation flows</h3>
      <div className="docs-figure">
        <QoeTelemetryFigure />
      </div>
      <p>
        Player-side: hook into the events from the previous chapter, fire telemetry via XHR
        or sendBeacon. Batch and gzip locally. Vendor SDKs handle this for you. Server-side:
        {' '}<strong>CMCD</strong> (CTA-5004) attaches session-level telemetry to every
        segment request as HTTP headers, so the CDN log and the player log share a session
        ID and can be joined.
      </p>
      <h3>Dimensions that matter</h3>
      <p>
        Roll up metrics by CDN, ISP, geo, device family, OS, app version, content type,
        title, encoding profile. A 10% rebuffer ratio overall might be 0.2% in NA-cellular
        and 65% in APAC-CDN-X — averages hide localised fires.
      </p>
      <h3>Alerting</h3>
      <p>
        Static thresholds (rebuffer &gt; 5%, VSF &gt; 3%) catch crashes. Anomaly detection
        per dimension catches degradation — e.g., a CDN PoP that started rebuffering 3x
        normal in Tokyo at 9pm.
      </p>
    </>
  ),
}
