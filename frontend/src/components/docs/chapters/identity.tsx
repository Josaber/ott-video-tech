import { Chapter } from '../common'
import {
  AccountProfilesDevicesFigure,
} from '../../figures'

export const chapter: Chapter = {
  slug: 'identity',
  title: 'Identity, profiles & devices',
  blurb: 'Account vs profile model, device registration, MVPD federation, OAuth providers.',
  render: () => (
    <>
      <p>
        Auth covered "is this JWT valid". This chapter covers the layer above — the data model
        that lets one household share an account, the system that tracks which devices a
        subscription has signed in on, and the federation paths real OTT uses for sign-in.
      </p>
      <div className="docs-figure">
        <AccountProfilesDevicesFigure />
      </div>

      <h3>Account vs profile</h3>
      <p>
        One <strong>account</strong> = one billing relationship, one entitlement, one set of
        household-level settings (region, language, payment method). Inside it, the user
        creates <strong>profiles</strong> — each with its own watch history, queue, maturity
        rating, recommendations, language preference. Netflix popularised the 5-profile cap;
        most platforms followed.
      </p>
      <ul>
        <li><strong>Adult profile</strong> — full catalog at the account's maturity tier.</li>
        <li><strong>Kid profile</strong> — content filtered to a kid rating (PG-13 etc.). No targeted ads (COPPA). Often forces SDH captions on.</li>
        <li><strong>Restricted profile</strong> — PIN-locked, age-gated. Optional.</li>
      </ul>

      <h3>Device registration</h3>
      <p>
        A device is whatever runs the player — a phone, a TV app, a console. The platform
        tracks <strong>registered devices</strong> (max ~10) and <strong>concurrent streams
        </strong> (max 4 for Premium tier, 2 for Standard, 1 for Basic). The concurrency
        check fires at <em>license-issue time</em> — not at app start — so signing in on a
        new device doesn't sign anyone out until they hit Play.
      </p>
      <p>
        Sign-out-everywhere is a single button in account settings. Under the hood it bumps
        a per-account <code>token_version</code> (same pattern this demo uses) so all
        previously-issued access tokens fail their next refresh.
      </p>

      <h3>MVPD / TV Everywhere federation</h3>
      <p>
        In the US, premium cable channels (HBO via Comcast, ESPN via DirecTV) authenticate via
        {' '}<strong>TVE</strong> (TV Everywhere) using <strong>Adobe Pass</strong> /
        <strong>Comcast SSO</strong>. The viewer enters their cable provider; the OTT app
        redirects to the MVPD's auth flow; on success the MVPD returns an entitlement token
        asserting "this household has the channel subscribed". The OTT app issues a session
        based on that — no separate username / password.
      </p>

      <h3>OAuth providers</h3>
      <p>
        Apple Sign In, Google Sign In, Facebook Login. Each issues an OIDC ID token; your
        backend verifies the signature, extracts an external user ID, looks up or creates an
        internal account. Apple Sign In has the relay-email caveat: the email is opaque
        unless the user opts to share, so you need a stable subject ID for account linking.
      </p>

      <h3>Magic links & passkeys</h3>
      <ul>
        <li><strong>Magic link</strong> — email or SMS containing a one-time-use signed URL. Bypasses passwords entirely. Common for CTV apps where typing a password on a remote is painful.</li>
        <li><strong>Passkeys (WebAuthn)</strong> — public-key auth tied to the device's secure enclave. Phishing-resistant, but CTV support is patchy.</li>
      </ul>

      <h3>Account recovery</h3>
      <p>
        Password reset via email is table stakes. Production also handles: lost device
        (revoke that device's registration), forgotten email (CS-mediated via billing
        provider), account takeover detection (sudden geography change, mass password resets
        → freeze account, force email confirmation).
      </p>
    </>
  ),
}
