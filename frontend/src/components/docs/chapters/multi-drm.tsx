import { Chapter } from '../common'
import {
  EMELicenseSequenceFigure,
} from '../../figures'

export const chapter: Chapter = {
  slug: 'multi-drm',
  title: 'Multi-DRM in production',
  blurb: 'Wiring Widevine + FairPlay + PlayReady through a DRM-as-a-Service vendor.',
  render: () => (
    <>
      <p>
        The DRM chapter named the three commercial CDMs. This chapter walks how an engineer
        actually wires them in — because nobody implements all three from scratch.
        Production OTT uses one of two paths: build a full license server in-house (Netflix,
        Disney+) or contract a <strong>DRM-as-a-Service</strong> vendor (everyone else).
      </p>

      <h3>The encrypt-once model</h3>
      <p>
        The packager produces <strong>CENC</strong>-encrypted segments — one set of bytes
        consumable by all three CDMs. A few specifics:
      </p>
      <ul>
        <li><strong>One key ID + content key per asset</strong> — or one per quality tier (SD / HD / UHD usually have separate keys so a low-security CDM can hold the SD key without unlocking HD).</li>
        <li><strong>PSSH (Protection System Specific Header) boxes</strong> in the init segment — one per CDM, carrying CDM-specific key wrapping. Widevine, PlayReady, FairPlay each have their own PSSH UUID.</li>
        <li><strong>FairPlay caveat</strong> — historically Apple required SAMPLE-AES, not CENC's cenc / cbcs schemes. Modern FairPlay accepts <code>cbcs</code> CENC mode, which is what every multi-DRM packager emits today.</li>
      </ul>

      <h3>License request flow</h3>
      <div className="docs-figure">
        <EMELicenseSequenceFigure />
      </div>
      <ol>
        <li>Player encounters an encrypted segment, fires the EME <code>encrypted</code> event.</li>
        <li>Player requests a media key session from the CDM (Widevine / FairPlay / PlayReady).</li>
        <li>CDM produces a <strong>license request blob</strong> — opaque, CDM-specific.</li>
        <li>Player POSTs the blob to a <strong>license URL</strong> provided by your platform.</li>
        <li>License URL handler validates the viewer's entitlement (subscription, rights window, geo, concurrent stream, HDCP), then forwards the blob to the DRM vendor's license server.</li>
        <li>Vendor returns a <strong>license response blob</strong> — wraps the content key for that CDM.</li>
        <li>Player feeds the response back to the CDM via <code>session.update()</code>.</li>
        <li>CDM unwraps the key and starts decrypting segments inside its trusted environment.</li>
      </ol>

      <h3>DRM-as-a-Service vendors</h3>
      <table className="docs-gaps">
        <thead><tr><th>Vendor</th><th>What they offer</th></tr></thead>
        <tbody>
          <tr><td>PallyCon</td><td>Widevine + FairPlay + PlayReady + forensic watermarking. Mid-tier pricing. Popular for Korean / SEA streamers.</td></tr>
          <tr><td>EZDRM</td><td>One-stop multi-DRM. Mid-tier. US-headquartered, broad adoption.</td></tr>
          <tr><td>BuyDRM (KeyOS)</td><td>Multi-DRM + analytics. Enterprise pricing. Common at tier-1 studios.</td></tr>
          <tr><td>Axinom</td><td>Multi-DRM + a full OTT platform stack. European, strong in CTV.</td></tr>
          <tr><td>Verimatrix</td><td>Multi-DRM + cardless conditional access for IPTV.</td></tr>
        </tbody>
      </table>

      <h3>Where your code sits</h3>
      <p>
        The vendor runs the license servers; you run the <strong>entitlement endpoint</strong>
        in front of them. That endpoint is the only place your business rules live —
        subscription status, rights window, country, parental controls, concurrent stream.
        The call out to the vendor is essentially: "given this verified entitlement, mint a
        license for this CDM with these constraints (HDCP level, persistence, output
        protection)".
      </p>

      <h3>Persistent vs session licenses</h3>
      <ul>
        <li><strong>Session license</strong> — valid only while the playback session is live. Default for streaming.</li>
        <li><strong>Persistent license</strong> — stored on the device for offline playback. Has its own expiry. Required for "download for offline" features. Usually billed at a premium per issuance.</li>
      </ul>

      <h3>Key rotation</h3>
      <p>
        For long live streams (or 24/7 channels), the content key rotates periodically. The
        manifest emits a new <code>#EXT-X-KEY</code> entry, the player asks for a new license
        with the new key ID, the CDM gets the wrapped key, decryption continues seamlessly.
        Rotation cadence is usually hourly for live, never for VOD.
      </p>

      <h3>Cost</h3>
      <p>
        License issuance fees at enterprise scale: $0.0001-0.001 per license. Persistent
        licenses can be 2-10× more. Forensic watermarking adds another fraction of a cent.
        For a 1 M-viewer-day platform at 1 license per session that's $100-1000/day of pure
        DRM cost — significant only at scale, but a real line item.
      </p>

      <h3>This demo's analogue</h3>
      <p>
        The signed license-URL endpoint in this demo plays the entitlement role: it
        validates the viewer (signed URL = entitlement check), enforces a per-request nonce
        (one playback session), then returns the AES-128 key. Swap the plaintext key
        response for a CDM-specific license blob fetched from a DRMaaS vendor and you have
        production DRM — the rest of the architecture is identical.
      </p>
    </>
  ),
}
