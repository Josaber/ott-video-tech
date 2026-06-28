import { Chapter } from '../common'
import {
  PlayerStackFigure,
} from '../../figures'

export const chapter: Chapter = {
  slug: 'player',
  title: 'Player & client architecture',
  blurb: 'HTMLMediaElement, MSE, EME, ABR algorithms — what hls.js actually does for you.',
  render: () => (
    <>
      <p>
        Browser-based playback rides on a three-layer browser API stack with a JavaScript
        player on top.
      </p>
      <h3>The browser stack</h3>
      <div className="docs-figure">
        <PlayerStackFigure />
      </div>
      <ul>
        <li><strong>HTMLMediaElement</strong> — the <code>&lt;video&gt;</code> tag itself. Exposes <code>play()</code>, <code>currentTime</code>, events (timeupdate, waiting, ended, error). Knows nothing about HLS / DASH directly except on Safari (native HLS).</li>
        <li><strong>MSE</strong> (Media Source Extensions, 2016 W3C). The JS player creates a <code>MediaSource</code>, attaches it to the video element, fetches segments itself, appends them to a <code>SourceBuffer</code>. Browser handles demux + decode + render.</li>
        <li><strong>EME</strong> (Encrypted Media Extensions). When the player encounters encrypted segments it asks for a license via <code>navigator.requestMediaKeySystemAccess()</code>; the browser routes the request to a CDM (Widevine / FairPlay / PlayReady) that holds the keys in a trusted environment and decrypts in-place.</li>
      </ul>
      <h3>Common JS players</h3>
      <table className="docs-gaps">
        <thead><tr><th>Player</th><th>What it covers</th></tr></thead>
        <tbody>
          <tr><td>hls.js</td><td>HLS-only. Lightweight, used in this demo. Handles MSE, ABR, EME for Widevine. Doesn't speak DASH.</td></tr>
          <tr><td>shaka-player</td><td>Google's player. HLS + DASH + CMAF, full EME (Widevine + FairPlay + PlayReady), offline storage. Heavier.</td></tr>
          <tr><td>video.js + plugins</td><td>UI-first framework. Wraps hls.js / shaka under the hood via plugins. Drop-in for legacy sites that already use it.</td></tr>
          <tr><td>dash.js</td><td>Reference DASH implementation. Less polished than shaka-player.</td></tr>
        </tbody>
      </table>
      <h3>iOS / Safari quirk</h3>
      <p>
        Until iOS 17 (2023), MSE wasn't available on Safari iOS — the only way to play HLS
        was the native <code>&lt;video src="*.m3u8"&gt;</code> path. That means hls.js /
        shaka don't run on iPhone of that era; you fall back to setting <code>video.src</code>
        {' '}directly. EME on FairPlay similarly differs — the license request and response
        shapes are FairPlay-specific.
      </p>
      <h3>ABR algorithms</h3>
      <ul>
        <li><strong>Throughput-based</strong> — measure recent download speed, pick the highest bitrate that fits with a safety margin. Easy, but oscillates on bursty connections.</li>
        <li><strong>Buffer-based (BOLA)</strong> — pick the bitrate that maximises a utility function of (current buffer length, requested bitrate). Smoother under stress.</li>
        <li><strong>Model-predictive (MPC / Pensieve)</strong> — predict throughput trajectory and run an optimisation. Best quality but harder to debug.</li>
      </ul>
      <p>
        hls.js uses a hybrid throughput + buffer-aware default. <code>config.abrEwmaDefaultEstimate</code> and friends let you tune.
      </p>
      <h3>Events to monitor</h3>
      <ul>
        <li><code>waiting</code> / <code>stalled</code> — player ran out of buffered data. Sum the time here = rebuffer time.</li>
        <li><code>timeupdate</code> — fires ~4x/sec, drives progress UI.</li>
        <li><code>error</code> — fatal player error. Codes 1-4 (aborted, network, decode, src not supported).</li>
        <li><code>levelSwitched</code> (hls.js) — ABR picked a new rendition.</li>
        <li><code>fragLoadError</code> (hls.js) — a segment fetch failed. Three in a row → fatal.</li>
      </ul>
      <h3>What this demo uses</h3>
      <p>
        hls.js in near-default config plus a custom <code>xhrSetup</code> that attaches the
        Bearer token to same-origin segment requests (so license.key + master.m3u8
        authenticate; ad-segment requests don't leak the token). Single-rendition manifest
        means no ABR switching to worry about. Player wraps a single{' '}
        <code>&lt;video&gt;</code> tag.
      </p>
    </>
  ),
}
