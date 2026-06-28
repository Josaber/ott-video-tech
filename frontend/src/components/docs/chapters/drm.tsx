import { Chapter } from '../common'
import {
  DRMLiteFlowFigure,
} from '../../figures'

export const chapter: Chapter = {
  slug: 'drm',
  title: 'DRM-lite vs production DRM',
  blurb: 'How the demo protects content, and how Widevine / FairPlay / PlayReady differ.',
  render: () => (
    <>
      <p>
        This demo encrypts every HLS segment with <strong>AES-128</strong> and gates the key
        behind a viewer-bound, time-bound, single-use signed URL. It is intentionally NOT a
        production DRM — see the comparison at the end. It is, however, the same shape: <em>
        opaque encrypted segments + a separate "license" path the server controls</em>.
      </p>
      <div className="docs-figure">
        <DRMLiteFlowFigure />
      </div>
      <h3>What the player sees</h3>
      <pre><code>{`#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:4
#EXT-X-KEY:METHOD=AES-128,
  URI="license.key?user=admin&exp=1781798175&nonce=…&sig=…",
  IV=0x...
#EXTINF:4.000000,
segment_000.ts
#EXT-X-ENDLIST`}</code></pre>
      <p>
        The <code>URI</code> on <code>#EXT-X-KEY</code> is generated freshly for the requesting
        viewer at manifest fetch time. The path itself is open (no Bearer required) — the URL
        itself is the credential.
      </p>
      <h3>HMAC signature anatomy</h3>
      <ul>
        <li><code>user</code> — the JWT subject that requested the manifest</li>
        <li><code>exp</code> — Unix timestamp after which the key returns 410 Gone</li>
        <li><code>nonce</code> — random 16 bytes, claimed once by <code>NonceStore</code></li>
        <li><code>sig</code> — HMAC-SHA256 of (user, exp, nonce) under the license-signing secret</li>
      </ul>
      <p>
        The signing secret is separate from the JWT secret (see
        <code>application.yml</code>). A leak of either does not compromise the other.
      </p>
      <h3>Production DRM landscape</h3>
      <p>
        Real OTT DRM uses <strong>EME</strong> (the browser API) + a <strong>CDM</strong>
        (Content Decryption Module) baked into the player / OS. The three commercial CDMs:
      </p>
      <ul>
        <li><strong>Widevine</strong> (Google) — Chrome, Firefox, Edge, Android.</li>
        <li><strong>FairPlay</strong> (Apple) — Safari, iOS, tvOS.</li>
        <li><strong>PlayReady</strong> (Microsoft) — Edge legacy, Xbox, Windows, many smart TVs.</li>
      </ul>
      <p>
        A <strong>CENC</strong>-encrypted bitstream is consumable by all three (FairPlay needs
        a small workaround), so providers ship one encrypted set of segments and three license
        servers. The license server returns a binary blob the CDM uses to derive segment keys.
        The plaintext never leaves the CDM's trusted environment.
      </p>
      <p>
        This demo would map to: AES-128 + HMAC URL → license server, hls.js → CDM, browser → EME.
        Production gives you four things the demo can't: device-level key handling, hardware
        decryption paths, robust output protection (HDCP), and an actual studio-grade audit
        trail. Demo gives you: clarity, ~150 lines of code, and zero patent licensing.
      </p>
    </>
  ),
}
