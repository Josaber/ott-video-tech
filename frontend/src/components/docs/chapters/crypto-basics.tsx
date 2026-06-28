import { Chapter } from '../common'
import {
  HmacFlowFigure,
} from '../../figures'

export const chapter: Chapter = {
  slug: 'crypto-basics',
  title: 'Cryptography primitives',
  blurb: 'AES, HMAC, nonces, signed URLs — what the DRM and auth chapters quietly assume.',
  render: () => (
    <>
      <p>
        DRM-lite uses AES-128 to encrypt segments and HMAC to sign license URLs. Auth uses
        HMAC-SHA256 to sign JWTs. The chapters describe the wiring but assume the reader
        knows what these primitives are. This chapter is the assumed background.
      </p>

      <h3>Symmetric vs asymmetric</h3>
      <p>
        <strong>Symmetric</strong> cryptography uses one secret key shared by both sides
        — fast, but the key has to be distributed securely. AES, HMAC, and DRM content
        keys are all symmetric.
      </p>
      <p>
        <strong>Asymmetric</strong> uses a key pair (public + private). Slower, but the
        public half can be published. TLS handshake + JWT signatures (RS256, ES256) use
        asymmetric. JWT HS256 (this demo) uses symmetric.
      </p>

      <h3>AES — Advanced Encryption Standard</h3>
      <p>
        Block cipher. Takes a 128-bit block of plaintext + a key (128, 192, or 256 bits),
        produces a 128-bit block of ciphertext. Universal hardware support since ~2010 via
        AES-NI on Intel / ARMv8 crypto extensions.
      </p>
      <p>
        AES alone only handles one block at a time; to encrypt a long stream you wrap it
        in a <strong>mode of operation</strong>:
      </p>
      <ul>
        <li><strong>CBC</strong> (Cipher Block Chaining) — each block XORs with the previous ciphertext before encrypt. Needs an IV. Order-dependent. HLS classic <code>#EXT-X-KEY METHOD=AES-128</code> uses CBC.</li>
        <li><strong>CTR</strong> (Counter mode) — XOR plaintext with AES(counter). Counter increments per block. Parallelisable. Used by CENC <code>cenc</code> scheme.</li>
        <li><strong>GCM</strong> (Galois/Counter Mode) — CTR + authentication tag in one pass. Most modern. TLS 1.3 uses it.</li>
        <li><strong>CBCS</strong> — CBC with chunked encryption. Used by CENC <code>cbcs</code> scheme (FairPlay-compatible).</li>
      </ul>

      <h3>HMAC — keyed hash for authentication</h3>
      <p>
        <strong>HMAC</strong> (Hash-based Message Authentication Code) takes a key and a
        message, produces a fixed-size tag (32 bytes for HMAC-SHA256). Anyone with the key
        can verify; anyone without the key can't forge a valid tag for a chosen message.
      </p>
      <div className="docs-figure">
        <HmacFlowFigure />
      </div>
      <pre><code>{`tag = HMAC(key, "user=alice&exp=1781796000&nonce=abc123")
url = "license.key?user=alice&exp=1781796000&nonce=abc123&sig=" + base64url(tag)`}</code></pre>
      <p>
        The receiver recomputes the HMAC from the URL's query params and compares to the
        provided sig. Match → trusted; mismatch → 403. The key never leaves the server.
        Comparison must use <strong>constant-time</strong> equality (e.g., <code>MessageDigest.isEqual</code>)
        to defeat timing side channels.
      </p>

      <h3>Nonce, IV, salt — non-secret random values</h3>
      <ul>
        <li><strong>Nonce</strong> ("number used once") — single-use random value bound to an operation. Prevents replay attacks. License URLs add a nonce so the same signed URL can't be replayed twice.</li>
        <li><strong>IV</strong> (Initialisation Vector) — random per-message starting state for a cipher in a chaining mode. AES-CBC requires a different IV per message under the same key.</li>
        <li><strong>Salt</strong> — random value appended to a password before hashing. Defeats rainbow tables. BCrypt + Argon2 generate salt automatically.</li>
      </ul>

      <h3>Hash functions</h3>
      <ul>
        <li><strong>SHA-256</strong> — 32-byte output. Modern default. Used in HMAC-SHA256, JWT HS256.</li>
        <li><strong>SHA-1</strong> — 20-byte output. Broken since 2017. Don't use for security.</li>
        <li><strong>MD5</strong> — 16-byte output. Completely broken since ~2008. Sometimes used as a non-security checksum.</li>
        <li><strong>BLAKE3</strong> — modern, ~5× SHA-256 throughput. Not yet widespread in OTT but rising.</li>
      </ul>

      <h3>Key derivation</h3>
      <p>
        A password is not a key — keys need to be uniform random bits.{' '}
        <strong>KDF</strong> functions (PBKDF2, scrypt, Argon2) stretch a password into a
        key with a salt and an iteration count tuned to be slow. BCrypt is a password-
        hashing function with this property built in.
      </p>

      <h3>Signed URLs — the pattern</h3>
      <p>
        Used everywhere in OTT — CDN URLs, DRM license URLs, share links. The pattern:
      </p>
      <ol>
        <li>Server constructs a canonical message from the URL's query params: <code>"path=/x&exp=N&user=Y"</code>.</li>
        <li>Server computes <code>sig = HMAC(secret_key, canonical_message)</code>.</li>
        <li>Server appends <code>&sig=base64url(sig)</code> to the URL and hands it to the client.</li>
        <li>The receiving server recomputes the HMAC from the query params and compares with constant-time equality.</li>
      </ol>
      <p>
        Same shape, different consumers: CloudFront / Akamai / Fastly all accept signed
        URLs, but the canonical-message format and signature encoding differ per vendor.
        This demo's license endpoint uses the same pattern.
      </p>
    </>
  ),
}
