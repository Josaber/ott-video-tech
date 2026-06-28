import { Chapter } from '../common'
import {
  FastEpgFigure,
} from '../../figures'

export const chapter: Chapter = {
  slug: 'epg-fast',
  title: 'FAST channels & EPG',
  blurb: 'Linear streaming returns: how on-demand platforms run free ad-supported channels.',
  render: () => (
    <>
      <p>
        Linear TV came back. <strong>FAST</strong> (Free Ad-supported Streaming TV) channels
        — Pluto, Tubi, Samsung TV Plus, the linear lanes inside Roku and Peacock — re-introduce
        the broadcast model on top of OTT plumbing. The viewer tunes in, watches what's
        playing now, and ads pay the bill. Users don't always realize they're using an
        on-demand platform's CDN; engineers absolutely do.
      </p>

      <h3>Channel as schedule, not as bytes</h3>
      <p>
        A FAST channel is fundamentally a <strong>schedule</strong>: a list of program assets
        + ad slots laid out on a wall clock. The player gets a live manifest that points at
        the program currently scheduled, then transitions at break boundaries. The
        underlying segments are usually CDN-cached VOD bytes — what changes is which playlist
        ref points where.
      </p>

      <h3>Evening schedule slice</h3>
      <div className="docs-figure">
        <FastEpgFigure />
      </div>

      <h3>EPG — Electronic Programming Guide</h3>
      <p>
        The schedule lives in an EPG: a structured representation of every channel × every
        time slot. Typical shape per entry:
      </p>
      <ul>
        <li>channel ID, program ID, asset ID</li>
        <li>start time / end time (UTC, wall clock)</li>
        <li>episode metadata (season, episode, synopsis, rating)</li>
        <li>ad break markers (where SSAI will splice)</li>
        <li>localization (regional schedule variants)</li>
      </ul>
      <p>
        EPG data is usually published as <strong>XMLTV</strong> or its successors — a flat
        file or feed updated daily, ingested by the client and the manifest service in
        tandem.
      </p>

      <h3>SCTE-35 markers</h3>
      <p>
        Inside the stream, SCTE-35 binary messages signal where breaks open and close. The
        live encoder injects them at the right PTS; the SSAI stitcher reads them and either
        splices in an ad pod or passes the program through. Each marker carries:
      </p>
      <ul>
        <li>
          <strong>splice_event_id</strong> — unique handle for this break
        </li>
        <li>
          <strong>splice_command_type</strong> — typically <code>splice_insert</code> (start
          or end) or <code>time_signal</code>
        </li>
        <li>
          <strong>break_duration</strong> — how long the break is allowed to be
        </li>
        <li>
          <strong>upid (Universal Program ID)</strong> — what program is starting / ending
        </li>
      </ul>
      <p>
        SSAI for linear is significantly harder than for VOD: the splice has to be exact to
        the frame, the ad pod has to fit in the allotted duration (no overrun), and the
        decisioning + encoding must happen in the seconds before the marker hits the player.
      </p>

      <h3>Player UX — what a FAST player does differently</h3>
      <ul>
        <li>
          <strong>No seek bar</strong> (or a heavily limited DVR window — usually 30 min
          back). Pure linear means seeking forward is impossible.
        </li>
        <li>
          <strong>Channel zapping</strong> — left/right or up/down switches channels in
          under a second. The manifest service must be ready to serve a new channel's
          manifest immediately; usually achieved by warm caches per channel.
        </li>
        <li>
          <strong>"Now / Next"</strong> overlay shows what's playing and what's after,
          populated from EPG.
        </li>
        <li>
          <strong>Replay-from-live</strong> — some FAST platforms let viewers restart the
          current program from its beginning. Implemented via a separate VOD asset linked
          from the EPG entry.
        </li>
      </ul>

      <h3>FAST vs vMVPD vs OTT-on-demand</h3>
      <table className="docs-gaps">
        <thead><tr><th>Model</th><th>Cost</th><th>Catalog</th><th>Examples</th></tr></thead>
        <tbody>
          <tr>
            <td><strong>FAST</strong></td>
            <td>free, ad-supported</td>
            <td>aggregated channels, often deep back catalog</td>
            <td>Pluto, Tubi, Samsung TV+, Roku Channel</td>
          </tr>
          <tr>
            <td><strong>vMVPD</strong></td>
            <td>paid subscription</td>
            <td>live cable bundle over IP</td>
            <td>YouTube TV, Hulu Live, Sling, DirecTV Stream</td>
          </tr>
          <tr>
            <td><strong>SVOD</strong></td>
            <td>paid subscription</td>
            <td>on-demand library</td>
            <td>Netflix, Disney+, HBO Max</td>
          </tr>
          <tr>
            <td><strong>AVOD / FAST-on-VOD</strong></td>
            <td>free, ad-supported</td>
            <td>on-demand library</td>
            <td>Tubi, Crackle, Freevee</td>
          </tr>
        </tbody>
      </table>

      <h3>Why FAST grew</h3>
      <ul>
        <li>
          <strong>Lower decision burden</strong> — many viewers prefer "what's on" to
          scrolling a catalog grid.
        </li>
        <li>
          <strong>Smart TV defaults</strong> — most CTV manufacturers ship FAST tiles on the
          home screen. Discovery is free.
        </li>
        <li>
          <strong>Cheap content reuse</strong> — back catalogs of broadcasters and studios
          slot into FAST channels with low incremental cost.
        </li>
        <li>
          <strong>Ad inventory growth</strong> — 100% ad-supported viewing time means more
          slots than SVOD's "ad tier".
        </li>
      </ul>

      <h3>What this demo doesn't have</h3>
      <p>
        The demo is strictly VOD: one asset, one manifest, no schedule, no SCTE-35, no FAST
        mode. Production parity for FAST would add an EPG service, a live-manifest origin
        per channel, a SCTE-35-aware SSAI stitcher, and a channel-switching player UX.
      </p>
    </>
  ),
}
