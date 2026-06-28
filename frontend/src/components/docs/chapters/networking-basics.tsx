import { Chapter } from '../common'
import {
  HttpVersionsFigure,
} from '../../figures'

export const chapter: Chapter = {
  slug: 'networking-basics',
  title: 'Networking primitives',
  blurb: 'TCP / UDP / QUIC, HTTP/1-2-3, TLS, byte range, CORS — the wire layer everything else rides on.',
  render: () => (
    <>
      <p>
        Every chapter from CDN onwards assumes the reader knows how the bytes get from
        origin to viewer. This chapter is that layer — what HTTP / TCP / UDP / TLS
        guarantee, what HTTP/2 + HTTP/3 changed, and the specific HTTP features (byte
        range, CORS) the streaming stack relies on.
      </p>

      <h3>TCP vs UDP vs QUIC</h3>
      <table className="docs-gaps">
        <thead><tr><th>Protocol</th><th>What it does</th></tr></thead>
        <tbody>
          <tr><td>TCP</td><td>Reliable byte stream. Guarantees in-order delivery; retries lost packets. Adds latency under packet loss. Substrate of HTTP/1.1 + HTTP/2.</td></tr>
          <tr><td>UDP</td><td>Unreliable datagrams. No retries, no ordering, no congestion control. Substrate for QUIC, SRT, RTP, WebRTC.</td></tr>
          <tr><td>QUIC</td><td>UDP-based but with reliability + congestion control built in. Multiplexed streams without head-of-line blocking. Substrate of HTTP/3.</td></tr>
        </tbody>
      </table>

      <h3>HTTP versions</h3>
      <p>
        Same semantics (GET, POST, headers, status codes), different wire format and
        connection behaviour:
      </p>
      <div className="docs-figure">
        <HttpVersionsFigure />
      </div>
      <ul>
        <li><strong>HTTP/1.1</strong> (1997) — one request per TCP connection at a time (pipelining never worked). Browsers open ~6 connections per origin. Plain text.</li>
        <li><strong>HTTP/2</strong> (2015) — binary framing on a single TCP connection. Multiplexed concurrent streams. Header compression. Server push (now deprecated). LL-HLS leans on it.</li>
        <li><strong>HTTP/3</strong> (2022) — same semantics as HTTP/2, but runs over QUIC (UDP). No TCP head-of-line blocking. 0-RTT resumption. Better on mobile / lossy networks.</li>
      </ul>

      <h3>TLS — encryption + identity</h3>
      <p>
        <strong>TLS</strong> wraps any transport in encryption + server authentication. The
        modern version is <strong>TLS 1.3</strong> (2018). The handshake establishes a
        shared symmetric key via Diffie-Hellman; the server proves it owns its hostname
        with a certificate signed by a Certificate Authority. After the handshake, all
        bytes are AES-GCM encrypted.
      </p>
      <p>
        TLS 1.3 is 1-RTT (one round trip before data flows) and supports 0-RTT for resumed
        sessions. CDN edges terminate TLS to save the origin from the handshake cost on
        every viewer.
      </p>

      <h3>HTTP byte range — partial GETs</h3>
      <p>
        Trick-play and CMAF need to fetch just part of a file. Standard HTTP:
      </p>
      <pre><code>{`GET /segment_001.ts HTTP/1.1
Range: bytes=48000-99999

HTTP/1.1 206 Partial Content
Content-Range: bytes 48000-99999/200000
Content-Length: 52000
[bytes]`}</code></pre>
      <p>
        Every CDN handles byte-range natively. The HLS{' '}
        <code>#EXT-X-BYTERANGE:length@offset</code> tag in an I-frame playlist resolves to
        this Range header.
      </p>

      <h3>CORS — cross-origin resource sharing</h3>
      <p>
        Browsers block cross-origin reads by default. To allow a page at{' '}
        <code>player.example.com</code> to fetch a segment at <code>cdn.example.net</code>,
        the CDN must respond with <code>Access-Control-Allow-Origin: *</code> (or the
        specific origin). For non-simple requests (custom headers, non-GET methods), the
        browser sends a <strong>preflight</strong> OPTIONS request first.
      </p>
      <p>
        Two places this bites OTT:
      </p>
      <ul>
        <li>SSAI: ad-service segments are served from a different origin than the program. Ad-service must send CORS headers.</li>
        <li>Bearer tokens: the player's <code>xhrSetup</code> shouldn't attach the program JWT to cross-origin segment requests — it leaks the token to whoever serves the segment.</li>
      </ul>

      <h3>DNS</h3>
      <p>
        Hostname resolution. For OTT, the load-bearing detail is that{' '}
        <strong>geo-routing</strong> often happens here — when a viewer queries{' '}
        <code>cdn.example.com</code>, the authoritative DNS returns the IP of the nearest
        CDN PoP based on the resolver's network. Multi-CDN routing is often a DNS-level
        switch via short-TTL CNAME records.
      </p>

      <h3>Connection lifecycle</h3>
      <p>
        Each new TCP+TLS connection costs 2-3 RTTs of handshake.{' '}
        <strong>Keep-alive</strong> (HTTP/1.1) and connection reuse (HTTP/2, HTTP/3) avoid
        re-handshaking per request — a big deal when a player fetches dozens of small
        segments per minute. Cold connection on slow Wi-Fi can easily add 500 ms of
        latency to the first frame.
      </p>
    </>
  ),
}
