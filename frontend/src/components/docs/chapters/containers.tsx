import { Chapter } from '../common'
import {
  ContainerStructureFigure,
} from '../../figures'

export const chapter: Chapter = {
  slug: 'containers',
  title: 'Containers',
  blurb: 'MP4, MKV, MOV, TS — what each wrapper actually does, and why streaming picked the ones it did.',
  render: () => (
    <>
      <p>
        A <strong>container</strong> (or <em>wrapper</em>) is the file format that holds the
        elementary streams — video, audio, subtitles, metadata — alongside an index that tells
        a player where each piece starts. The container is NOT the codec: an .mp4 file can
        carry H.264, H.265 or AV1 video; an .mkv file can carry literally any codec the player
        understands. Mismatching the two is the source of "the file plays in VLC but not in
        Safari" frustration — usually Safari supports the container but not the codec inside.
      </p>
      <div className="docs-figure">
        <ContainerStructureFigure />
      </div>
      <h3>Common containers</h3>
      <table className="docs-gaps">
        <thead>
          <tr>
            <th>Container</th>
            <th>Where it lives</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>MP4 (.mp4) — ISO BMFF</td>
            <td>The web / download workhorse. Universal hardware decode, indexed for fast seek. Backbone of OTT downloads, social media, the HTML5 <code>&lt;video&gt;</code> tag.</td>
          </tr>
          <tr>
            <td>MOV (.mov) — QuickTime</td>
            <td>Apple's predecessor to MP4 (ISO BMFF descended from MOV — they share most of the box structure). Common from Apple encoders, ProRes mezzanines, iPhone recordings.</td>
          </tr>
          <tr>
            <td>MKV (.mkv) — Matroska</td>
            <td>Open, extensible, carries anything: every codec, multiple audio + subtitle tracks, chapters. Dominant for desktop ripping, Plex / Jellyfin libraries, encoder testing — rarely shipped to consumers.</td>
          </tr>
          <tr>
            <td>WebM (.webm)</td>
            <td>Matroska subset locked to royalty-free codecs (VP8 / VP9 / AV1 + Vorbis / Opus). Browser <code>MediaRecorder</code> defaults to it. YouTube and Twitter publish in it.</td>
          </tr>
          <tr>
            <td>MPEG-TS (.ts)</td>
            <td>188-byte packetized stream designed for broadcast satellite. Picked up by classic HLS for its alignment friendliness. Still the default for live OTT today.</td>
          </tr>
          <tr>
            <td>fMP4 / CMAF (.m4s)</td>
            <td>MP4 split into self-describing fragments. Modern HLS and DASH share this; one set of segments serves both manifests. Replacing .ts in production VOD.</td>
          </tr>
          <tr>
            <td>3GP (.3gp)</td>
            <td>Mobile-era ISO BMFF subset (smaller boxes, mono audio profiles). Most relevant on legacy feature phones in emerging markets; the codec / container that <em>still</em> ships on bottom-tier Android.</td>
          </tr>
          <tr>
            <td>MXF (.mxf)</td>
            <td>Professional broadcast — tape replacement. SMPTE-standard, complex, used by editorial and contribution links. Never reaches the viewer.</td>
          </tr>
          <tr>
            <td>AVI (.avi) — legacy</td>
            <td>Microsoft's 1992 container. Very forgiving of arbitrary codecs but lacks a proper duration / fragment index. Replaced by MP4 / MKV in every modern context.</td>
          </tr>
          <tr>
            <td>FLV (.flv) — legacy</td>
            <td>Old Flash Video. Effectively dead since Flash sunsetted in 2020. Mentioned because some legacy ingest stacks still emit it.</td>
          </tr>
        </tbody>
      </table>
      <h3>Container vs codec, in one example</h3>
      <p>
        An iPhone records H.264 video + AAC audio inside a .mov container. To put it on a
        website you can <code>ffmpeg -i input.mov -c copy output.mp4</code> — same codecs,
        different wrapper, no re-encoding (a "remux"). To target an older Android chipset you
        might then <code>ffmpeg -i output.mp4 -c:v libx264 -profile:v baseline -c:a aac output_compat.mp4</code>
        {' '}— this time re-encoding the video into the H.264 baseline profile because the
        chipset can't decode high.
      </p>
      <h3>What this demo uses</h3>
      <p>
        Uploads are accepted as any browser-recognised <code>video/*</code> MIME — usually
        .mp4 from a phone, sometimes .mov. FFmpeg transcodes to H.264 / AAC and packages as
        {' '}<strong>MPEG-TS</strong> segments inside an HLS manifest; the ad-service does the
        same. A production system in 2026 would prefer <strong>CMAF</strong> .m4s, but .ts is
        still what hls.js and native HLS work with by default.
      </p>
    </>
  ),
}
