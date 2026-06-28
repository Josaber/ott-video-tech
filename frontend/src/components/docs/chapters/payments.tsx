import { Chapter } from '../common'
import {
  SubscriptionStateMachineFigure,
} from '../../figures'

export const chapter: Chapter = {
  slug: 'payments',
  title: 'Payments & billing',
  blurb: "Subscription lifecycle, App Store IAP, family plans, cross-platform entitlement.",
  render: () => (
    <>
      <p>
        OTT revenue maps onto a small state machine of subscriptions and a fan-out of
        purchase paths (web checkout, App Store IAP, Play Store IAP, third-party MVPD
        bundles). Engineering work is mostly: model the states correctly, reconcile across
        purchase paths, never let entitlement drift from the source of truth.
      </p>

      <h3>Subscription state machine</h3>
      <div className="docs-figure">
        <SubscriptionStateMachineFigure />
      </div>
      <ul>
        <li><strong>TRIAL → ACTIVE.</strong> Trial end + first charge succeeds.</li>
        <li><strong>ACTIVE → PAST_DUE.</strong> Recurring charge fails (declined card, expired card, insufficient funds).</li>
        <li><strong>PAST_DUE → ACTIVE.</strong> Smart retry (Stripe Adaptive Acceptance, Adyen Risk Engine) recovers the charge within ~3-7 days.</li>
        <li><strong>PAST_DUE → DUNNING.</strong> Retry budget exhausted. Now in an explicit grace period (typically 7 days) during which the viewer can still play but receives in-app reminders.</li>
        <li><strong>DUNNING → CANCELED.</strong> Grace expires without payment. Access cut at the next license-issue check.</li>
        <li><strong>CANCELED → ACTIVE.</strong> Re-subscribe.</li>
      </ul>

      <h3>App Store / Play Store IAP</h3>
      <p>
        Apple and Google require their billing for any digital subscription consumed inside
        their respective apps — and take a 15-30% cut. Engineering reality:
      </p>
      <ul>
        <li><strong>Receipt validation.</strong> Both stores issue signed receipts. Back-end validates with Apple / Google's verification endpoint, never trusts the client.</li>
        <li><strong>Server-to-server notifications.</strong> Renewal events, refunds, grace-period transitions arrive as webhooks (Apple App Store Server Notifications, Google Real-Time Developer Notifications).</li>
        <li><strong>No outbound link to web checkout.</strong> Apple's anti-steering rules forbid the app from linking out to your web payment page — though the 2024 Epic Games settlement carved out exceptions in some regions.</li>
        <li><strong>Web-purchased subscriptions still work in the iOS app.</strong> The viewer can sign up on your website, then sign in on iOS and watch. Their entitlement just doesn't flow through Apple IAP.</li>
      </ul>

      <h3>Family plans</h3>
      <p>
        Disney+ Premier Access, Netflix Standard with extra members, Apple One Family. One
        billing account, multiple <em>secondary members</em>, each with their own login and
        profile but sharing the entitlement. Implementation: a one-to-many{' '}
        <code>account → linked_users</code> table with per-member limits.
      </p>

      <h3>Regional pricing & taxation</h3>
      <ul>
        <li><strong>Regional pricing.</strong> Netflix charges $7.99 in the US and ₹149 in India. PPP-adjusted, market-positioned.</li>
        <li><strong>Tax.</strong> VAT in the EU, GST in India, sales tax in some US states. Calculated by Stripe Tax / Vertex / Avalara at checkout time.</li>
        <li><strong>Currency.</strong> Charge in local currency; settle in USD or another reporting currency. FX rates locked at charge time.</li>
      </ul>

      <h3>Entitlement service</h3>
      <p>
        The single source of truth for "can this viewer play this content right now". Sits
        in front of the license endpoint. Inputs: account ID, profile ID, asset rights
        (window, region), device, payment status, concurrent stream count. Output: yes / no
        / yes-with-degradation (e.g., SD-only on a non-HDCP device).
      </p>
      <p>
        Production OTT runs the entitlement service in a tier-0 SLO: it's on the play path.
        If it goes down, no one watches anything. Common pattern: read replicas + aggressive
        edge caching keyed on (account, asset).
      </p>

      <h3>Chargebacks & refunds</h3>
      <p>
        Credit-card chargebacks arrive 60-120 days after the charge. The platform owes the
        processor the chargeback fee (~$15) and forfeits the original revenue. High
        chargeback rates (&gt;1%) get the merchant account flagged. Engineering work: fraud
        scoring at sign-up, address verification (AVS), 3-D Secure, and rapid refunds for
        accidental subscriptions before they hit dispute.
      </p>
    </>
  ),
}
