import { Chapter } from '../common'

export const chapter: Chapter = {
  slug: 'manifest',
  title: 'Manifest deep-dive',
  blurb: 'Every #EXT tag in an HLS playlist plus how DASH expresses the same ideas.',
  render: () => (
    <>
      <p>
        HLS essentials covered the two-layer concept. This chapter walks the tags individually
        and contrasts them with the DASH equivalents.
      </p>
      <h3>Master playlist</h3>
      <pre><code>{`#EXTM3U
#EXT-X-VERSION:6
#EXT-X-INDEPENDENT-SEGMENTS

#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="aac-en",NAME="English",
  DEFAULT=YES,AUTOSELECT=YES,LANGUAGE="en",URI="audio/en.m3u8"
#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="subs",NAME="English",
  DEFAULT=YES,LANGUAGE="en",URI="subs/en.m3u8"

#EXT-X-STREAM-INF:BANDWIDTH=2400000,RESOLUTION=1280x720,
  CODECS="avc1.64001f,mp4a.40.2",AUDIO="aac-en",SUBTITLES="subs"
720p/index.m3u8

#EXT-X-I-FRAME-STREAM-INF:BANDWIDTH=200000,RESOLUTION=1280x720,
  CODECS="avc1.64001f",URI="720p/iframes.m3u8"`}</code></pre>
      <ul>
        <li><code>#EXT-X-INDEPENDENT-SEGMENTS</code> — every segment starts with a keyframe; the player can switch at any boundary without rebuffering.</li>
        <li><code>#EXT-X-MEDIA</code> — alternate audio / subtitle / closed-caption tracks grouped together. Players surface them as language switchers.</li>
        <li><code>#EXT-X-STREAM-INF</code> — one per video rendition. <code>CODECS</code> is the strict RFC 6381 codec string the player uses to confirm it can decode without fetching.</li>
        <li><code>#EXT-X-I-FRAME-STREAM-INF</code> — separate I-frame-only playlist for fast trick-play (scrubbing, thumbnail strips).</li>
      </ul>
      <h3>Media playlist</h3>
      <pre><code>{`#EXTM3U
#EXT-X-VERSION:6
#EXT-X-TARGETDURATION:4
#EXT-X-MEDIA-SEQUENCE:0
#EXT-X-DISCONTINUITY-SEQUENCE:0
#EXT-X-PLAYLIST-TYPE:VOD
#EXT-X-MAP:URI="init.mp4"

#EXT-X-KEY:METHOD=AES-128,URI="license.key?...",IV=0x...
#EXT-X-PROGRAM-DATE-TIME:2026-06-19T10:00:00Z

#EXTINF:4.000,
segment_000.m4s
#EXTINF:4.000,
segment_001.m4s

#EXT-X-DISCONTINUITY
#EXT-X-DATERANGE:ID="ad-1",CLASS="ad",
  START-DATE="2026-06-19T10:00:08Z",DURATION=12.0
#EXTINF:4.000,
ad_000.m4s
#EXTINF:4.000,
ad_001.m4s
#EXTINF:4.000,
ad_002.m4s
#EXT-X-DISCONTINUITY

#EXTINF:4.000,
segment_002.m4s

#EXT-X-ENDLIST`}</code></pre>
      <ul>
        <li><code>#EXT-X-TARGETDURATION</code> — upper bound on segment duration. Player polls the playlist at half this for live.</li>
        <li><code>#EXT-X-MEDIA-SEQUENCE</code> — first segment's sequence number. Increments forever for live as old segments drop off the window.</li>
        <li><code>#EXT-X-PLAYLIST-TYPE</code> — VOD (finite, has ENDLIST) or EVENT (live but appendable; manifest only grows).</li>
        <li><code>#EXT-X-MAP</code> — init segment (the MP4 'ftyp' + 'moov' boxes) needed before any media segment.</li>
        <li><code>#EXT-X-KEY</code> — the encryption preamble. Applies to all following segments until the next KEY tag.</li>
        <li><code>#EXT-X-PROGRAM-DATE-TIME</code> — wall-clock anchor. Lets the player compute "current live edge" and "you joined 5s late".</li>
        <li><code>#EXT-X-DISCONTINUITY</code> + <code>#EXT-X-DATERANGE</code> — what this demo's SSAI writes around an ad break.</li>
        <li><code>#EXT-X-ENDLIST</code> — VOD only. Tells the player "no more segments coming".</li>
      </ul>
      <h3>LL-HLS tags</h3>
      <p>
        Low-Latency HLS adds partial-segment delivery. <code>#EXT-X-PART-INF</code> declares
        partial duration, <code>#EXT-X-PART</code> lists partials inside an in-progress
        segment, <code>#EXT-X-PRELOAD-HINT</code> nudges the player to request the next
        partial before it's even listed.
      </p>
      <h3>DASH equivalent</h3>
      <pre><code>{`<MPD type="dynamic" minimumUpdatePeriod="PT2S" ...>
<Period start="PT0S">
  <AdaptationSet contentType="video" segmentAlignment="true">
    <Representation id="720p" bandwidth="2400000" codecs="avc1.64001f">
      <SegmentTemplate timescale="1000" duration="4000"
        media="720p/seg_$Number$.m4s" initialization="720p/init.m4s" />
    </Representation>
  </AdaptationSet>
  <AdaptationSet contentType="audio" lang="en">
    ...
  </AdaptationSet>
</Period>
</MPD>`}</code></pre>
      <p>
        Hierarchy: <strong>Period</strong> (a chapter or ad break) → <strong>AdaptationSet
        </strong> (one media type — video, audio, subtitles) → <strong>Representation</strong>
        {' '}(one bitrate / codec variant) → <strong>SegmentTemplate</strong> or{' '}
        <strong>SegmentList</strong> (where to find the bytes). CMAF lets one set of .m4s
        files serve both an HLS .m3u8 and a DASH .mpd.
      </p>
    </>
  ),
}
