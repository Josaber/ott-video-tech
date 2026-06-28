import { Chapter } from '../common'
import {
  ForensicWatermarkFigure,
} from '../../figures'

export const chapter: Chapter = {
  slug: 'anti-piracy',
  title: 'Anti-piracy beyond DRM',
  blurb: 'HDCP, forensic watermarking, screen-capture detection, geofencing, account sharing.',
  render: () => (
    <>
      <p>
        DRM encrypts the bytes and gates the key. That stops file copy + replay. It doesn't
        stop a viewer pointing a 4K camera at a TV, or a CDM exploit dumping decrypted frames
        out of memory. Real OTT layers more on top.
      </p>
      <h3>Output protection — HDCP</h3>
      <p>
        <strong>HDCP</strong> (High-bandwidth Digital Content Protection) encrypts the link
        between source (set-top, dongle, browser) and display. Studios mandate HDCP levels
        per content tier:
      </p>
      <ul>
        <li><strong>HDCP 2.2</strong> — required for 4K HDR and Dolby Vision.</li>
        <li><strong>HDCP 1.4</strong> — required for HD.</li>
        <li>None — SD only.</li>
      </ul>
      <p>
        If the player can't negotiate the required HDCP version with the connected display,
        the license server can refuse to issue the key — or issue a key that only unlocks an
        SD rendition. iOS / Android enforce this at the OS level; browsers query through
        EME's <code>MediaKeyStatus</code>.
      </p>
      <h3>Forensic watermarking</h3>
      <p>
        A per-viewer identifier embedded subtly in the video itself. Two approaches:
      </p>
      <ul>
        <li><strong>Pre-baked A/B variants.</strong> Encode bit-shifted versions of every segment; the per-viewer manifest stitches a unique sequence (segment 0 = variant A, 1 = variant B...). A 30-bit ID needs 30 segments — easy in a VOD movie.</li>
        <li><strong>Server-side watermark.</strong> Insert the per-viewer ID into the bitstream at packaging time. More CPU at packaging, less storage.</li>
      </ul>
      <div className="docs-figure">
        <ForensicWatermarkFigure />
      </div>
      <p>
        When a leak appears on a piracy site, the studio runs a forensic tool over the
        captured frames, recovers the ID, traces it back to the account, terminates and
        pursues.
      </p>
      <h3>Screen-capture & runtime protection</h3>
      <ul>
        <li><strong>iOS</strong> — <code>UIScreen.isCaptured</code> tells the app the screen is being mirrored / recorded; the player blanks the video.</li>
        <li><strong>Android</strong> — <code>FLAG_SECURE</code> on the player window blocks <code>screenrecord</code>, screenshots, casting.</li>
        <li><strong>Widevine L1</strong> — keys never reach userland; decryption happens in TEE (TrustZone). L3 (software-only) is allowed for SD but blocked for HD.</li>
        <li><strong>FairPlay + HDCP</strong> — Safari blanks the canvas if you try to read pixels off the video element.</li>
      </ul>
      <h3>Token-signed URLs</h3>
      <p>
        Manifests and segments served from a CDN are guarded by short-lived signed URLs (or
        signed cookies). The CDN validates the signature at the edge before serving — no
        origin round-trip. CloudFront, Akamai, Fastly all support this. Signing key rotation
        is typically every 15 min for streaming.
      </p>
      <h3>Geofencing</h3>
      <p>
        Per-asset country allowlist or denylist, consulted at license-issue time. IP
        geolocation is the standard signal (MaxMind, IPinfo). VPN detection is the eternal
        adversarial game: residential IP databases, latency profiling, and "no ASN we
        recognise" all flag suspect traffic. License denies, player shows the "not available
        in your region" wall.
      </p>
      <h3>Concurrent stream & account sharing</h3>
      <p>
        Concurrent-stream limits enforced at license-issue time (the license server keeps a
        per-account active-stream ledger). Account sharing detection looks at deeper signals
        — device fingerprint diversity, geographic centroid of usage, login patterns,
        time-of-day clustering — and downgrades or challenges suspected shared accounts.
        Netflix's 2023 crackdown is the canonical example.
      </p>
    </>
  ),
}
