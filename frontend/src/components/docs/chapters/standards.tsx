import { Chapter } from '../common'

export const chapter: Chapter = {
  slug: 'standards',
  title: 'Standards & organisations',
  blurb: 'Who defines what — SMPTE, ISO/MPEG, IETF, W3C, CTA, IAB, AOMedia.',
  render: () => (
    <>
      <p>
        Video is a thicker stack of standards than almost any other software domain. Knowing
        who publishes what helps when an SDK release note name-drops a spec.
      </p>
      <table className="docs-gaps">
        <thead><tr><th>Body</th><th>What they publish</th></tr></thead>
        <tbody>
          <tr><td><strong>SMPTE</strong> — Society of Motion Picture and Television Engineers</td><td>Broadcast standards — color spaces, timecode, MXF, IMF (SMPTE 2067), ST 2110 (uncompressed IP). The Hollywood / studio side.</td></tr>
          <tr><td><strong>ISO/IEC MPEG</strong> — Moving Picture Experts Group</td><td>Video codecs (MPEG-2, H.264 / AVC, H.265 / HEVC, H.266 / VVC), MPEG-DASH, CMAF (ISO/IEC 23000-19), CENC (ISO/IEC 23001-7).</td></tr>
          <tr><td><strong>IETF</strong> — Internet Engineering Task Force</td><td>Transport protocols — HLS (RFC 8216, an Apple-authored draft adopted by IETF), HTTP/2 + 3, the WebRTC IETF side, SRT, RIST.</td></tr>
          <tr><td><strong>W3C</strong> — World Wide Web Consortium</td><td>Browser-side APIs — HTML5 video, Media Source Extensions, Encrypted Media Extensions, WebCodecs, schema.org / VideoObject.</td></tr>
          <tr><td><strong>CTA</strong> — Consumer Technology Association</td><td>CTA-5004 (CMCD), CTA-WAVE (cross-vendor streaming test suite), Connected TV certification.</td></tr>
          <tr><td><strong>IAB Tech Lab</strong></td><td>Ad-tech standards — VAST, VMAP, VPAID (legacy), OpenRTB, ads.txt, IFA (Identifier For Advertising). The ad ecosystem's standards body.</td></tr>
          <tr><td><strong>AOMedia</strong> — Alliance for Open Media</td><td>AV1, AV2 (in progress), royalty-free codec stewardship.</td></tr>
          <tr><td><strong>ATSC</strong> — Advanced Television Systems Committee</td><td>North American broadcast TV — ATSC 1.0 (digital terrestrial), ATSC 3.0 (NextGen TV, IP-based).</td></tr>
          <tr><td><strong>DVB</strong> — Digital Video Broadcasting</td><td>European broadcast standards — DVB-T / S / C / IPTV. The OTT-relevant pieces (DVB-DASH) overlap with MPEG-DASH.</td></tr>
          <tr><td><strong>CableLabs</strong></td><td>Cable / MSO standards — ADI 3.0 (video metadata exchange), DOCSIS (the cable modem standard), Reliable Broadcast Transport.</td></tr>
          <tr><td><strong>EBU</strong> — European Broadcasting Union</td><td>R128 (loudness), EBU-TT-D (captions), broadcast workflow standards.</td></tr>
          <tr><td><strong>MovieLabs</strong></td><td>Studio-driven security and metadata. ML Common Security Model, Enhanced Content Protection. Sets the bar for forensic watermarking.</td></tr>
          <tr><td><strong>Dolby Laboratories</strong></td><td>Proprietary but de-facto standards — AC-3, E-AC-3, Atmos, Dolby Vision. Licensed.</td></tr>
        </tbody>
      </table>
      <h3>How to read this</h3>
      <p>
        A spec like "Widevine modular DRM" lives at the intersection of W3C EME (browser
        API), ISO CENC (encryption format), and Google's proprietary CDM. "HLS with
        Widevine" pulls in IETF (HLS), W3C (EME), ISO (CENC) and CableLabs (encryption test
        vectors). Almost nothing in this stack lives inside a single organisation.
      </p>
    </>
  ),
}
