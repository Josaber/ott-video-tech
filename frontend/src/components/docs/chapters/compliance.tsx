import { Chapter } from '../common'

export const chapter: Chapter = {
  slug: 'compliance',
  title: 'Compliance & accessibility',
  blurb: 'WCAG, EAA, CVAA, age gates, loudness norms — what regulators require.',
  render: () => (
    <>
      <p>
        Operating a streaming service means complying with regulators in every market. The
        rules cluster into accessibility, age-appropriate content, loudness and data
        protection.
      </p>
      <h3>Accessibility regulation</h3>
      <table className="docs-gaps">
        <thead><tr><th>Region</th><th>Rule</th></tr></thead>
        <tbody>
          <tr><td>US — federal</td><td>21st Century Communications and Video Accessibility Act (CVAA, 2010) — requires captions, audio description, accessible player UI. Enforced by the FCC.</td></tr>
          <tr><td>US — federal contracts</td><td>Section 508 — IT used by federal agencies must meet WCAG 2.0 AA. Vendors comply to remain eligible.</td></tr>
          <tr><td>US — civil rights</td><td>ADA (Americans with Disabilities Act) — used in lawsuits against streaming UIs that aren't screen-reader compatible.</td></tr>
          <tr><td>EU</td><td>European Accessibility Act (EAA, mandatory June 2025) — covers audiovisual on-demand services. Penalty regime per member state.</td></tr>
          <tr><td>UK</td><td>Equality Act 2010; Ofcom Code requires statutory caption / AD / sign-language minimums.</td></tr>
          <tr><td>Canada</td><td>Accessible Canada Act + AODA (Ontario). Mandatory captions and AD percentages.</td></tr>
        </tbody>
      </table>
      <h3>WCAG 2.2 for video (AA-level checks)</h3>
      <ul>
        <li><strong>1.2.2 Captions (Prerecorded)</strong> — caption track required for all pre-recorded audio content.</li>
        <li><strong>1.2.3 Audio Description (Prerecorded)</strong> — audio description or full-text alternative.</li>
        <li><strong>1.2.5 Audio Description (AA)</strong> — audio description required, no text alternative substitute.</li>
        <li><strong>1.4.5 Images of text</strong> — caption track, not burned-in subtitles.</li>
        <li><strong>2.1 Keyboard</strong> — all player controls reachable without a pointer.</li>
        <li><strong>2.3.1 Three flashes</strong> — no content that flashes more than 3 times/sec (epilepsy trigger).</li>
        <li><strong>4.1.2 Name, Role, Value</strong> — screen reader can announce play / pause / seek state.</li>
      </ul>
      <h3>Captioning vs subtitles vs audio description</h3>
      <ul>
        <li><strong>Captions</strong> — for deaf or hard-of-hearing viewers. Include speaker IDs, sound effects, music descriptions.</li>
        <li><strong>Subtitles</strong> — for hearing viewers who don't speak the audio language. Dialogue only.</li>
        <li><strong>SDH (Subtitles for the Deaf and Hard-of-hearing)</strong> — combines both: target-language captions with HoH cues.</li>
        <li><strong>Audio description (AD)</strong> — narrated description of on-screen action between dialogue. Required by CVAA, EAA. Studios contract voice actors for this.</li>
      </ul>
      <h3>Ratings & age gates</h3>
      <p>
        Every region has a content ratings body whose codes must appear on the title page
        and gate playback for minors:
      </p>
      <ul>
        <li><strong>MPAA</strong> — US (G / PG / PG-13 / R / NC-17).</li>
        <li><strong>BBFC</strong> — UK (U / PG / 12 / 15 / 18).</li>
        <li><strong>FSK</strong> — Germany (0 / 6 / 12 / 16 / 18).</li>
        <li><strong>CSA</strong> — France (TP / -10 / -12 / -16 / -18).</li>
        <li><strong>GRAC</strong> — South Korea.</li>
        <li><strong>CERO</strong> — Japan.</li>
        <li><strong>NRTA</strong> — China (strict content review, not just rating).</li>
      </ul>
      <p>
        Profile-level parental controls enforce these per household. Some regions (DE, FR)
        have mandatory time-of-day curfews for higher-rated content even per profile.
      </p>
      <h3>Loudness compliance</h3>
      <ul>
        <li><strong>US — CALM Act / ATSC A/85</strong> — -24 LKFS ±2 dB. FCC enforces.</li>
        <li><strong>EU — EBU R128</strong> — -23 LUFS ±1 dB. Required across DVB and most VOD.</li>
        <li><strong>Streaming (non-regulated, de-facto)</strong> — -16 LUFS (Spotify, Apple), -14 LUFS (YouTube).</li>
      </ul>
      <h3>Data protection</h3>
      <p>
        Viewing data is personal data. GDPR (EU), CCPA (California) and similar regional
        rules require explicit consent for non-essential telemetry, the right to download
        history, and the right to delete.
      </p>
    </>
  ),
}
