import { Chapter } from '../common'
import {
  AudioSamplingFigure,
} from '../../figures'

export const chapter: Chapter = {
  slug: 'audio-basics',
  title: 'Audio fundamentals',
  blurb: 'Pressure waves, sampling, bit depth, channels — the layer below the audio codec chapter.',
  render: () => (
    <>
      <p>
        Codec chapters mention AAC at 128 kbps stereo without spelling out what's being
        compressed. This chapter is the layer below: how a sound becomes a stream of numbers,
        and what the codec then squeezes.
      </p>

      <h3>From pressure wave to samples</h3>
      <p>
        Sound is a pressure wave — alternating compression and rarefaction in air. A
        microphone turns it into a voltage that varies continuously in time. To put it in a
        file, the recorder takes <strong>samples</strong> at regular intervals and stores
        each as a number.
      </p>
      <div className="docs-figure">
        <AudioSamplingFigure />
      </div>
      <p>
        The number of samples per second is the <strong>sample rate</strong>. The Nyquist
        theorem says you can reconstruct any frequency up to half the sample rate. Audible
        sound tops out around 20 kHz, so the sample rate has to be at least ~40 kHz.
      </p>
      <table className="docs-gaps">
        <thead><tr><th>Sample rate</th><th>Use</th></tr></thead>
        <tbody>
          <tr><td>44.1 kHz</td><td>CD-quality. Nyquist + a small filter margin. Default for most music delivery.</td></tr>
          <tr><td>48 kHz</td><td>Video / broadcast default. Aligns with 24 / 25 / 30 fps frame rates.</td></tr>
          <tr><td>96 / 192 kHz</td><td>Mastering and high-res audio. Headroom for post-production filters; no perceptible playback benefit for most listeners.</td></tr>
        </tbody>
      </table>

      <h3>Bit depth</h3>
      <p>
        Each sample is quantised to an integer. <strong>Bit depth</strong> sets how many
        levels:
      </p>
      <ul>
        <li><strong>16-bit</strong> — 65,536 levels. CD-quality. 96 dB dynamic range. Streaming default.</li>
        <li><strong>24-bit</strong> — 16 M levels. 144 dB. Mastering and broadcast.</li>
        <li><strong>32-bit float</strong> — effectively unlimited headroom. Used inside DAWs to avoid clipping during processing.</li>
      </ul>

      <h3>Channels</h3>
      <p>
        Each channel is its own stream of samples — left, right, surround, height. See the
        Channel layout entry in the Glossary for Mono / Stereo / 5.1 / 7.1 / Atmos.
      </p>

      <h3>PCM vs perceptual compression</h3>
      <p>
        Raw samples (<strong>PCM</strong>) are huge — 1.4 Mb/s for CD stereo, 6 Mb/s for
        24-bit 96 kHz 5.1. Streaming uses <strong>perceptual codecs</strong> (AAC, Opus,
        AC-3, E-AC-3) that exploit how the ear works:
      </p>
      <ul>
        <li><strong>Frequency masking</strong> — a loud tone at one frequency makes nearby quieter tones inaudible. Drop those bits.</li>
        <li><strong>Threshold of hearing</strong> — the ear is most sensitive around 2-5 kHz, drops off at the edges. Quantise less precisely outside the sensitive band.</li>
        <li><strong>Temporal masking</strong> — a loud event masks quiet events just before and after it.</li>
      </ul>
      <p>
        128 kbps AAC is ~10× smaller than CD-quality PCM but indistinguishable to most
        listeners on most material.
      </p>

      <h3>Loudness</h3>
      <p>
        Sample peaks ≠ perceived loudness. The ear integrates over time and across the
        spectrum. <strong>LUFS</strong> (Loudness Units relative to Full Scale, ITU 1770)
        is the streaming-standard measurement. See <em>Mezzanine & mastering</em> for the
        normalisation targets per market.
      </p>
    </>
  ),
}
