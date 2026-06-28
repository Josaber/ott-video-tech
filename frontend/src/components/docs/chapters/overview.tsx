import { Chapter } from '../common'
import { ArchitectureDiagram } from '../../ArchitectureDiagram'

export const chapter: Chapter = {
  slug: 'overview',
  title: 'Overview',
  blurb: 'What this demo is and how the pieces fit together.',
  render: () => (
    <>
      <p>
        <strong>OTT</strong> (Over-The-Top) is video delivered over the public internet, bypassing
        traditional cable and satellite. This project is a deliberately small end-to-end VOD slice:
        a single React SPA, a Spring Boot backend that orchestrates publishing with Temporal, a
        separate Spring Boot ad-service that generates a real pre-roll on demand, and PostgreSQL
        for metadata.
      </p>
      <p>
        Publishing a video runs through six stages — <em>UPLOAD → TRANSCODE → PACKAGE → SSAI → DRM
        → PUBLISH</em> — each tracked as a row in <code>processing_jobs</code> and orchestrated by
        a Temporal workflow keyed off the asset's UUID. The diagram below shows the runtime shape
        (boxes match the JobStage enum, the amber dashed box is the cross-process Ad-Service):
      </p>
      <div className="docs-figure">
        <ArchitectureDiagram />
      </div>
      <h3>Default ports</h3>
      <ul>
        <li><code>5173</code> — Vite dev server (this SPA)</li>
        <li><code>8080</code> — Spring Boot backend (API + playback + workflow)</li>
        <li><code>8090</code> — Ad-Service (VAST + ad ts segments)</li>
        <li><code>5432</code> — PostgreSQL (Flyway-managed schema)</li>
      </ul>
    </>
  ),
}
