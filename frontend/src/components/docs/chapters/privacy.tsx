import { Chapter } from '../common'
import {
  ConsentFlowFigure,
} from '../../figures'

export const chapter: Chapter = {
  slug: 'privacy',
  title: 'Privacy & consent',
  blurb: 'TCF v2, IFA / IDFA / GAID, ATT, COPPA — the engineering side of data protection.',
  render: () => (
    <>
      <p>
        Compliance named the regulators (GDPR, CCPA, EAA, CVAA). This chapter names the
        engineering primitives that implement compliance: consent strings, advertising IDs,
        platform tracking policies, kids-content carve-outs. Production OTT keeps a privacy
        team adjacent to the platform team because every new feature that touches user data
        gets reviewed against these rules.
      </p>
      <div className="docs-figure">
        <ConsentFlowFigure />
      </div>

      <h3>IAB TCF v2.2 consent string</h3>
      <p>
        The industry-standard wire format for a viewer's consent choices. A short
        base64-encoded string that encodes:
      </p>
      <ul>
        <li><strong>Purposes</strong> — 10 enumerated data-processing purposes (storage, personalisation, ad measurement, analytics, etc.). Per-purpose <code>YES</code> / <code>NO</code>.</li>
        <li><strong>Vendors</strong> — which of the ~1,000 registered ad-tech vendors the user has consented to.</li>
        <li><strong>Special features</strong> — geolocation, device scan.</li>
        <li><strong>Legitimate interest</strong> overrides where the vendor processes under that legal basis instead of consent.</li>
      </ul>
      <p>
        Every downstream consumer (ad server, analytics, recommendation pipeline) reads the
        TCF string before processing. If the relevant purposes aren't consented, the data
        path short-circuits. CMP vendors: <strong>OneTrust</strong>,{' '}
        <strong>Sourcepoint</strong>, <strong>Didomi</strong>, <strong>TrustArc</strong>.
      </p>

      <h3>Advertising identifiers</h3>
      <table className="docs-gaps">
        <thead><tr><th>Identifier</th><th>Platform</th></tr></thead>
        <tbody>
          <tr><td>IDFA</td><td>iOS — opt-in via App Tracking Transparency (ATT) since iOS 14.5. Default OFF; opt-in rate is ~25% globally.</td></tr>
          <tr><td>GAID / AAID</td><td>Android — opt-out. Google announced full deprecation by 2026, replaced by Privacy Sandbox on Android.</td></tr>
          <tr><td>Roku ID for Advertising (RIDA)</td><td>Roku — per-device, resettable.</td></tr>
          <tr><td>Tizen TIFA / LG LGUDID</td><td>Smart-TV vendor-specific.</td></tr>
          <tr><td>OTT identifier</td><td>Industry effort — a hashed-email-based or first-party device ID that survives platform opt-outs. UID2 / RampID / ID5.</td></tr>
        </tbody>
      </table>

      <h3>iOS App Tracking Transparency (ATT)</h3>
      <p>
        Since iOS 14.5, any app that tracks the user across apps / sites must show a system
        prompt asking permission. Decline → IDFA returns as zeros, retargeting paths
        deactivate. The OTT impact: ad CPMs on iOS dropped 30-50% after ATT; targeted
        recommendations using ad-tech vendors went dark for 75% of iOS users.
      </p>

      <h3>COPPA — kids content</h3>
      <p>
        US COPPA (Children's Online Privacy Protection Act): no behavioural tracking on
        under-13 content. Engineering carve-outs:
      </p>
      <ul>
        <li>Kid profiles get no IFA, no behavioural analytics, no targeted ads.</li>
        <li>Content classified as kids-directed sets a "kids" flag on the manifest, which the ad server uses to serve only contextual ads.</li>
        <li>Verifiable parental consent (VPC) gate for any data collection beyond minimum operational.</li>
      </ul>

      <h3>Data Subject Access Requests (DSAR)</h3>
      <p>
        GDPR Article 15 (access) and 17 (erasure). Implementation: a self-service portal +
        a backend pipeline that snapshots every system the user's data lives in (account
        DB, viewing history, recommendation embeddings, ad-tracking, support tickets),
        packages a JSON / CSV export, and on deletion request, purges or anonymises across
        all of them within 30 days. Tools: <strong>OneTrust</strong>,{' '}
        <strong>Transcend</strong>, <strong>DataGrail</strong> automate the fan-out.
      </p>

      <h3>Cookieless tracking landscape</h3>
      <p>
        Third-party cookies are being phased out on Chrome (Privacy Sandbox) and already gone
        on Safari + Firefox. OTT's response: <strong>first-party identifiers</strong>{' '}
        (the platform's own signed-in user ID, used cross-device with proper consent),
        {' '}<strong>data clean rooms</strong> (Snowflake, InfoSum, Habu — let two parties
        intersect their audiences without exchanging raw data), and{' '}
        <strong>contextual targeting</strong> (target by content category instead of by
        viewer identity).
      </p>
    </>
  ),
}
