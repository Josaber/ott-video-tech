import { Chapter } from '../common'
import {
  MasteringPipelineFigure,
} from '../../figures'

export const chapter: Chapter = {
  slug: 'mezzanine',
  title: 'Mezzanine & mastering',
  blurb: "The high-quality intermediate file every delivery encode comes from.",
  render: () => (
    <>
      <p>
        Before transcoding produces ABR renditions you need a <strong>mezzanine</strong> — the
        high-quality intermediate that's the source of truth for every delivery encode. The
        demo accepts whatever comes out of a phone; a production catalog accepts only a tightly
        spec'd mezzanine and refuses anything else.
      </p>
      <h3>Common mezzanine formats</h3>
      <table className="docs-gaps">
        <thead><tr><th>Format</th><th>Where it's used</th></tr></thead>
        <tbody>
          <tr><td>ProRes 422 HQ / 4444</td><td>Apple intermediate codec. Studio + post-production standard. ~220 Mb/s HD, ~880 Mb/s 4K. Bit-rate is "high enough not to matter" — easy to grade.</td></tr>
          <tr><td>DNxHR / DNxHD</td><td>Avid's intermediate, same role. Common in broadcast workflows.</td></tr>
          <tr><td>JPEG 2000 in MXF</td><td>SMPTE-standard. DCDM (Digital Cinema Distribution Master) and some studio OTT delivery formats. Visually lossless but slow to decode.</td></tr>
          <tr><td>IMF (SMPTE 2067)</td><td>Interoperable Master Format — component-based packaging. Video, audio tracks, subtitles, supplemental material bundled with sidecar XML (CPL, PKL, AssetMap). Studio delivery standard since ~2015.</td></tr>
          <tr><td>H.264 / HEVC mezzanine</td><td>Lossier compromise. Used by smaller ingest paths or when the original master is already H.264 and re-encoding would hurt further.</td></tr>
        </tbody>
      </table>
      <h3>Mastering pipeline</h3>
      <p>
        Capture (camera) → edit (NLE: Avid, Premiere, Resolve) → color grade (Resolve,
        Baselight) → audio mix → render (proxy → conform → output) → mezzanine → ingest. Each
        step is usually a separate team and facility for tentpole content.
      </p>
      <div className="docs-figure">
        <MasteringPipelineFigure />
      </div>
      <h3>Quality control</h3>
      <p>
        Automated QC tools enforce spec compliance before ingest: <strong>Tektronix Aurora
        </strong>, <strong>Vidchecker</strong>, <strong>Interra Baton</strong>. Common checks:
        pixel artifacts, audio loudness, black / silent frame detection, captioning sync,
        color gamut excursions, file integrity.
      </p>
      <h3>Loudness</h3>
      <p>
        Audio is measured in <strong>LUFS</strong> (or LKFS for ATSC) — integrated loudness
        across the whole program. Common targets:
      </p>
      <ul>
        <li><strong>-23 LUFS</strong> — EBU R128 (European broadcast)</li>
        <li><strong>-24 LKFS</strong> — ATSC A/85 (US broadcast, the "CALM Act" target)</li>
        <li><strong>-16 LUFS</strong> — typical streaming (Spotify, Apple Music)</li>
        <li><strong>-14 LUFS</strong> — louder streaming target (YouTube)</li>
      </ul>
      <p>
        Ads must match the program's loudness target — otherwise the volume jump triggers
        viewer complaints, and in the US regulator fines.
      </p>
      <h3>Color & HDR</h3>
      <p>
        SDR sticks to <strong>BT.709</strong> color primaries with a power-2.2 / 2.4 gamma
        curve. HDR moves to <strong>BT.2020</strong> (wider gamut) with one of two transfer
        functions: <strong>PQ</strong> (Perceptual Quantizer — Dolby Vision / HDR10, absolute
        brightness reference) or <strong>HLG</strong> (Hybrid Log-Gamma — BBC, NHK,
        backwards-compatible with SDR displays).
      </p>
    </>
  ),
}
