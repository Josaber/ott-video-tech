import { Chapter } from '../common'
import {
  CaptionsPipelineFigure,
} from '../../figures'

export const chapter: Chapter = {
  slug: 'captions',
  title: 'Captions & subtitles workflow',
  blurb: 'WebVTT, TTML, sidecar vs in-band, and the auto-transcribe + translate fan-out pipeline.',
  render: () => (
    <>
      <p>
        Compliance covered the regulatory side. This chapter covers the engineering side. The
        caption / subtitle layer of an OTT catalog is a parallel pipeline that runs alongside
        the video pipeline — format choice, authoring tool, language fan-out, QC, packaging,
        delivery — and it costs roughly as much per program as transcoding.
      </p>

      <h3>Format families</h3>
      <table className="docs-gaps">
        <thead><tr><th>Format</th><th>Where it lives</th></tr></thead>
        <tbody>
          <tr>
            <td>WebVTT (.vtt)</td>
            <td>Browser-native. The format HLS prefers. Plain text with cue timestamps, optional styling, voice tags. What every modern web player consumes.</td>
          </tr>
          <tr>
            <td>SRT (.srt)</td>
            <td>Simple legacy text. Universal in non-streaming workflows. Not playable in HLS or browsers directly — transcoded to WebVTT at packaging time.</td>
          </tr>
          <tr>
            <td>TTML / EBU-TT-D / IMSC1</td>
            <td>W3C XML caption format with rich styling, positioning, animation. Studios author master subtitles in IMSC1 (the modern profile); European broadcasters use EBU-TT-D. Carried over HLS via <code>EXT-X-MEDIA TYPE=SUBTITLES</code>.</td>
          </tr>
          <tr>
            <td>CEA-608 / CEA-708</td>
            <td>Captions encoded inside the video bitstream itself. The legacy broadcast standard. Modern OTT prefers sidecar but FAST channels often still carry 608.</td>
          </tr>
        </tbody>
      </table>

      <h3>Minimal WebVTT</h3>
      <pre><code>{`WEBVTT

00:00:00.000 --> 00:00:04.500
<v Narrator>The story begins with a small town
on the edge of nowhere.

00:00:04.500 --> 00:00:08.200 line:0 position:50%
[wind howling]

STYLE
::cue { background: rgba(0,0,0,0.8); color: white; }`}</code></pre>

      <h3>HLS wiring</h3>
      <p>
        Each language gets its own media playlist; the master playlist groups them under{' '}
        <code>SUBTITLES="subs"</code> and the variant streams reference that group:
      </p>
      <pre><code>{`# master.m3u8
#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="subs",NAME="English",
  DEFAULT=YES,AUTOSELECT=YES,LANGUAGE="en",URI="subs/en.m3u8"
#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="subs",NAME="Español",
  LANGUAGE="es",URI="subs/es.m3u8"
#EXT-X-STREAM-INF:BANDWIDTH=2400000,CODECS="avc1.64001f,mp4a.40.2",
  AUDIO="aac",SUBTITLES="subs"
720p/index.m3u8

# subs/en.m3u8 (media playlist for subtitle segments)
#EXTM3U
#EXT-X-VERSION:6
#EXT-X-TARGETDURATION:240
#EXTINF:240.0,
en_0.vtt
#EXT-X-ENDLIST`}</code></pre>

      <h3>DASH wiring</h3>
      <p>
        DASH expresses subtitles as an <code>AdaptationSet</code> with{' '}
        <code>contentType="text"</code> and either inline TTML or a <code>SegmentTemplate</code>
        {' '}pointing at WebVTT / IMSC1 chunks. Same SUBTITLES group concept, XML instead of
        playlist text.
      </p>

      <h3>Authoring & translation workflow</h3>
      <div className="docs-figure">
        <CaptionsPipelineFigure />
      </div>
      <ol>
        <li><strong>Transcribe</strong> source-language audio. Auto (Whisper, Deepgram, AssemblyAI, Rev Reverb) costs ~$0.20-1.00 / minute and hits 92-97% word accuracy. Human transcription costs $1-5 / minute and hits 99%.</li>
        <li><strong>Align + clean.</strong> Force-align cues against the audio, split into reading-rate-compliant lines (max ~17 chars/sec, max 2 lines, max ~36 chars/line), add speaker IDs and sound effects for HoH captions.</li>
        <li><strong>Translate.</strong> Fan-out per language: machine translation (DeepL, NMT models) is ~85% acceptable for streaming; tentpole content goes through human post-edit.</li>
        <li><strong>Vendor review.</strong> Studios contract specialists — Iyuno, IYUNO-SDI, ZOO Digital, Pixelogic — for human QC.</li>
        <li><strong>Package.</strong> Transcode master into WebVTT, segment for HLS, write the SUBTITLES group lines into the master playlist.</li>
      </ol>

      <h3>Captions vs subtitles vs SDH</h3>
      <ul>
        <li><strong>Captions</strong> — for deaf / HoH viewers. Include speaker IDs, sound effects, music descriptions.</li>
        <li><strong>Subtitles</strong> — translation aid for hearing viewers. Dialogue only.</li>
        <li><strong>SDH</strong> (Subtitles for the Deaf and Hard-of-hearing) — translation + HoH cues. Used when there's no captions track in the source language.</li>
      </ul>

      <h3>Sync challenges</h3>
      <p>
        Captions must align with audio sample-accurately. Common breakages: drift from a
        non-zero-start media offset (PROGRAM-DATE-TIME mismatch), segment-boundary cue splits
        that lose the second half, framerate-induced timecode rounding (24p vs 23.976 NTSC).
        Production runs a sync-validation pass before publishing.
      </p>
    </>
  ),
}
