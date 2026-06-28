import { Chapter } from '../common'
import {
  DevicePlatformsFigure,
} from '../../figures'

export const chapter: Chapter = {
  slug: 'devices',
  title: 'Device platforms & SDKs',
  blurb: 'Where the OTT app actually ships — web, mobile, CTV, console.',
  render: () => (
    <>
      <p>
        The backend is one stack; the clients are many. Each device family has its own SDK,
        its own player constraints, its own UX patterns, and its own store / certification
        process. Production OTT typically maintains 8-12 client codebases simultaneously.
      </p>
      <div className="docs-figure">
        <DevicePlatformsFigure />
      </div>

      <h3>Web</h3>
      <p>
        Single codebase, runs everywhere a modern browser does. Uses hls.js / shaka-player
        + EME with Widevine on Chrome / Firefox / Edge and FairPlay on Safari. Easiest to
        ship, frequent updates, no store gatekeeper.
      </p>

      <h3>Mobile</h3>
      <ul>
        <li><strong>iOS / iPadOS / tvOS</strong> — native Swift with AVPlayer + FairPlay. App Store submission, 15-30% revenue cut, weekly review timeline.</li>
        <li><strong>Android</strong> — native Kotlin or Java with ExoPlayer (now Media3) + Widevine. Play Store similar economics, faster review.</li>
        <li><strong>Cross-platform</strong> — React Native + react-native-video, Flutter + video_player. Trades some native quality for one codebase.</li>
      </ul>

      <h3>CTV — Connected TV</h3>
      <p>
        The hardest tier. Each smart-TV vendor has their own SDK, OS, performance ceiling
        and store. UX is "10-foot UI" — large fonts, big focus rings, D-pad navigation
        (no touch).
      </p>
      <table className="docs-gaps">
        <thead><tr><th>Platform</th><th>What it takes</th></tr></thead>
        <tbody>
          <tr><td>Apple TV (tvOS)</td><td>Swift with AVPlayer + FairPlay. Best dev ergonomics of the CTV family.</td></tr>
          <tr><td>Roku</td><td>BrightScript + SceneGraph. Proprietary language, unique ecosystem. Massive US install base (~70M devices). Roku-specific player APIs (PlayReady DRM with custom interfaces).</td></tr>
          <tr><td>Fire TV / Android TV / Google TV</td><td>Android SDK with Leanback library. ExoPlayer + Widevine. Largest CTV install base globally.</td></tr>
          <tr><td>Samsung Tizen</td><td>JavaScript + Web APIs + Samsung Smart TV Studio. PlayReady DRM. SDK quirks, slow review.</td></tr>
          <tr><td>LG webOS</td><td>JavaScript + webOS SDK. PlayReady DRM. Similar workflow to Tizen.</td></tr>
          <tr><td>Chromecast / Google Cast</td><td>Receiver app (HTML5 + Cast SDK) + sender SDKs on iOS / Android / web. Different UX paradigm: phone is the remote, TV is just display.</td></tr>
          <tr><td>Vizio SmartCast / Hisense VIDAA</td><td>Smaller stores, regional. Often outsourced or built on a partner SDK.</td></tr>
        </tbody>
      </table>

      <h3>Console</h3>
      <ul>
        <li><strong>PlayStation</strong> — Sony's proprietary SDK. Custom player layer + PlayReady DRM. Cert process is rigorous (weeks).</li>
        <li><strong>Xbox</strong> — UWP (Universal Windows Platform) or Microsoft Store native app. PlayReady DRM (Microsoft's). Easier than PlayStation but still cert-gated.</li>
      </ul>

      <h3>Code sharing strategies</h3>
      <p>
        Three practical patterns:
      </p>
      <ul>
        <li><strong>Native per platform.</strong> Best player quality, highest engineering cost. Tier-1 OTT (Netflix, Disney+) does this.</li>
        <li><strong>React Native or Flutter for mobile + native CTV.</strong> Compromise — share business logic across iOS/Android, native for everything else.</li>
        <li><strong>Web-everywhere.</strong> Build a web app, wrap it for CTV (Tizen / webOS / Roku BrightScript-bridged web view). Lowest cost, lowest quality. Smaller streamers + FAST channels.</li>
      </ul>

      <h3>What's shared regardless</h3>
      <p>
        The backend (catalog API, license endpoint, entitlement service, recommendations),
        the media itself (HLS / DASH / CMAF manifests + segments), the consent string, the
        entitlement model. The clients differ; everything north of the network is one
        implementation.
      </p>
    </>
  ),
}
