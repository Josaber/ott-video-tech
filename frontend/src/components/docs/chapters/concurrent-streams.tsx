import { Chapter } from '../common'
import {
  ConcurrentStreamGuardFigure,
} from '../../figures'

export const chapter: Chapter = {
  slug: 'concurrent-streams',
  title: 'Concurrent streams & account-sharing limits',
  blurb: 'Token + device fingerprint + heartbeat = the household contract every OTT enforces.',
  render: () => (
    <>
      <p>
        Every OTT subscription has a household limit — Netflix Standard caps at 2
        simultaneous streams, Premium at 4; Disney+ at 4; HBO Max at 3; etc. Enforcing this
        is a deceptively hard distributed-systems problem: the streams are on different
        devices in different cities issuing different requests, and yet the platform must
        decide in milliseconds whether one more request crosses the line.
      </p>

      <h3>The decision flow</h3>
      <div className="docs-figure">
        <ConcurrentStreamGuardFigure />
      </div>

      <h3>Three signals, one decision</h3>
      <ol>
        <li>
          <strong>Token validity</strong> — JWT (or opaque session) issued at login, bound
          to a device. Expired or revoked → deny.
        </li>
        <li>
          <strong>Device fingerprint</strong> — composite of model, OS version, app build,
          hardware identifier, network. Stable enough to recognize the same device, fuzzy
          enough to survive an OS update. The platform stores the user's registered devices
          and limits how many can stream concurrently.
        </li>
        <li>
          <strong>Concurrent count</strong> — a counter keyed by the account ID. Decremented
          on session end (explicit signout, heartbeat timeout, license expiry).
        </li>
      </ol>

      <h3>The concurrent-count problem</h3>
      <p>
        Naively: keep a Redis counter per account. Increment on play, decrement on stop.
        The catch is that clients lie about stopping — they close the laptop lid, lose
        connectivity, get killed by the OS, all without sending the "stop" event.
      </p>
      <p>
        Production solution is <strong>heartbeats</strong>: the player POSTs every 30-60s
        while a session is active. The server treats absence-of-heartbeat as session end
        and decrements the counter after a grace period (~90 s). Heartbeats also carry CMCD-style
        QoS data so this endpoint is genuinely multi-purpose.
      </p>

      <h3>Household definition</h3>
      <p>
        "Household" is the policy lever for account sharing. Different platforms set it
        differently:
      </p>
      <ul>
        <li>
          <strong>Strict household</strong> (Netflix 2023+): primary home anchored by IP /
          GPS / device. Outside-home streams require step-up auth or a paid "extra member"
          slot.
        </li>
        <li>
          <strong>Soft household</strong> (most others): any device that has logged in
          counts toward the cap; ignored where they sit geographically.
        </li>
        <li>
          <strong>Profile-based</strong>: profiles within an account are not separate
          households; they all share the cap.
        </li>
      </ul>

      <h3>Step-up auth</h3>
      <p>
        When a stream looks suspicious — new device, new geography, exceeded cap — the
        right answer is not always "deny". The right answer is often <strong>step-up</strong>:
        ask the user to confirm via email / SMS / password re-entry. Real households move,
        travel, lend a TV to a relative. Step-up authenticates intent without burning the
        user's trust.
      </p>

      <h3>License Server's role</h3>
      <p>
        The cap is enforced not just at play-auth time but at every license issuance. The
        License Server checks "is this device's session still counted, and are we within the
        cap?" before minting a fresh license. If a fourth stream sneaks past play-auth via a
        race, the License Server is the second gate.
      </p>

      <h3>Geo drift detection</h3>
      <p>
        Two streams from the same account, one in Seattle and one in Mumbai, at the same
        time, with no plausible travel between them: that's not concurrent viewing, that's
        credential sharing. Detection signals:
      </p>
      <ul>
        <li>
          <strong>Geo distance / time</strong> — implausible travel rate between sessions.
        </li>
        <li>
          <strong>Network ASN</strong> — same account on two unrelated ASNs over the past
          month with no overlap.
        </li>
        <li>
          <strong>Device diversity</strong> — six different makes/models in a year on what
          should be a four-person household.
        </li>
      </ul>
      <p>
        These do <em>not</em> automatically deny — they feed a risk score that triggers
        step-up at the next session boundary, or a quiet email warning.
      </p>

      <h3>Paid extra slots</h3>
      <p>
        Once enforcement is real, the natural product question is: how does a user who
        legitimately has a college student abroad keep them streaming? Answer: a paid
        add-on slot tied to that device. Most major OTTs introduced this between 2022 and 2024
        after years of soft enforcement.
      </p>

      <h3>What this demo doesn't enforce</h3>
      <p>
        The demo issues one access token per login with no concurrent-stream tracking. A
        single user could open the player in N tabs and stream all N simultaneously.
        Production parity would add a Redis-backed concurrent counter, a heartbeat endpoint,
        and a License Server gate.
      </p>
    </>
  ),
}
