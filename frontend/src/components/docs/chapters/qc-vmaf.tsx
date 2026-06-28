import { Chapter, L } from '../common'
import {
  VmafLadderFigure,
} from '../../figures'

export const chapter: Chapter = {
  slug: 'qc-vmaf',
  title: 'QC & VMAF — measuring perceptual quality',
  blurb: 'Why every ABR rung is graded against the source with VMAF before it ships.',
  render: () => (
    <>
      <p>
        When the pipeline emits a 1080p rendition at 3.2 Mbps, how do you know it's
        <em> actually</em> good? The packager's exit code says the bytes are valid HLS, but
        says nothing about whether the picture looks right. That's what <strong>QC (quality
        control)</strong> is — and at the heart of modern OTT QC sits <strong>VMAF</strong>,
        a perceptual quality metric originally developed at Netflix and now an industry
        standard.
      </p>

      <h3>Why VMAF, not PSNR or SSIM</h3>
      <p>
        <strong>PSNR</strong> measures per-pixel error against the source. It correlates
        poorly with how humans perceive quality — heavy compression can drop PSNR a lot
        while still looking fine, or boost PSNR while the image looks worse. <strong>SSIM
        </strong> compares structural similarity; better than PSNR but still purely
        mathematical.
      </p>
      <p>
        <strong>VMAF (Video Multi-method Assessment Fusion)</strong> is a machine-learning
        model trained on thousands of human ratings. It blends multiple per-frame features
        (VIF, ADM, motion) through a regressor to produce a score from <strong>0 to 100</strong>
        that maps to subjective opinion. The number is calibrated: <strong>95+ ≈ visually
        indistinguishable from source</strong>, <strong>90 ≈ great</strong>, <strong>80 ≈
        acceptable</strong>, <strong>below 70 ≈ users complain</strong>.
      </p>

      <h3>Bitrate vs quality, per resolution</h3>
      <div className="docs-figure">
        <VmafLadderFigure />
      </div>
      <p>
        Each resolution rung has a saturation curve. Push too few bits at 1080p and VMAF
        collapses; push too many at 480p and you're spending bandwidth past the point a
        human can tell. The <strong>knee</strong> of each curve is the sweet spot — the
        bitrate where one more megabit doesn't buy a perceptible improvement.
      </p>

      <h3>Per-title encoding</h3>
      <p>
        Traditional ABR ladders use a fixed bitrate per rung for every asset — 1080p at
        5 Mbps, 720p at 2.5 Mbps, etc. <strong>Per-title encoding</strong> recomputes the
        ladder per asset by sweeping bitrates and measuring VMAF per rung. A simple cartoon
        hits VMAF 95 at 1080p with 1.5 Mbps; a complex sports broadcast may need 7 Mbps.
        Netflix reports 20-30% bandwidth savings on the simple end of the catalog with no
        quality drop.
      </p>

      <h3>Where VMAF runs in the pipeline</h3>
      <ol>
        <li>
          Transcode produces N candidate renditions (one per ABR rung, possibly multiple
          bitrate trials per rung for per-title tuning).
        </li>
        <li>
          QC service downsamples each candidate to a common reference resolution, then runs
          FFmpeg's <code>libvmaf</code> filter against the mezzanine source to produce a
          VMAF score per frame.
        </li>
        <li>
          Aggregate scores (mean, p10, p1) decide whether the rung passes:
          <ul>
            <li>mean VMAF ≥ ladder target (e.g. 92 for 1080p)</li>
            <li>p10 VMAF ≥ floor (e.g. 80) — catches scenes that look bad even if the average is fine</li>
            <li>per-frame banding / blocking detectors (separate from VMAF) flag visible artifacts</li>
          </ul>
        </li>
        <li>Failing rungs trigger a re-encode at higher bitrate or a manual review queue.</li>
      </ol>

      <h3>VMAF flavors and pitfalls</h3>
      <ul>
        <li>
          <strong>VMAF NEG</strong> — a tuned model that resists enhancement gaming (sharpening
          an encode to boost VMAF without genuinely improving quality).
        </li>
        <li>
          <strong>4K VMAF</strong> — the default model is trained at 1080p; for 4K source comparison
          use the <code>vmaf_4k</code> model.
        </li>
        <li>
          <strong>Resolution mismatch</strong> — comparing a 720p encode to a 4K source naively
          penalizes the encode for not being 4K. Always upsample the encode to source
          resolution before scoring.
        </li>
        <li>
          <strong>HDR comparison</strong> — VMAF was trained on SDR. For HDR (PQ / HLG)
          the recommended approach is to score in the linear-light domain or use
          HDR-aware variants under active development.
        </li>
      </ul>

      <h3>What this demo doesn't do</h3>
      <p>
        The demo's pipeline transcodes once and ships. There's no VMAF scoring step,
        per-title sweep, or QC failure queue. The architecture doc in <code>/docs/vod-architecture.md</code>
        shows where it should live (the Package → DRM → QC → Publish chain), but the actual
        QC node is one of the <L slug="gaps">production gaps</L> deferred for scope.
      </p>
    </>
  ),
}
