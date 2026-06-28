// Wire types shared across the domain-specific API modules. Kept in one
// file (rather than co-located with each domain) so that, e.g.,
// `Asset` lives next to `Series` — they reference each other and end up
// imported together more often than not.

export type AssetStatus = 'UNPUBLISHED' | 'PROCESSING' | 'PUBLISHED' | 'FAILED'

export type EditorialState = 'DRAFT' | 'IN_REVIEW' | 'READY'

export interface Asset {
  id: string
  title: string
  description: string | null
  status: AssetStatus
  editorialState: EditorialState
  category: string | null
  rawUploaded: boolean
  playbackUrl: string | null
  thumbnailsUrl: string | null
  posterUrl: string | null
  drmKeyIdPreview: string | null
  adId: string | null
  adDurationMs: number | null
  // Series/season attachment — null when the asset is standalone.
  // seasonId + episodeNumber are the canonical FK fields; the rest are
  // denormalized on the backend so the UI can render "Foo · S2 E5"
  // without joining client-side.
  seasonId: string | null
  episodeNumber: number | null
  seriesId: string | null
  seriesTitle: string | null
  seasonNumber: number | null
  createdAt: string
  updatedAt: string
}

export interface Series {
  id: string
  title: string
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface Season {
  id: string
  seriesId: string
  seasonNumber: number
  title: string | null
  createdAt: string
  updatedAt: string
}

export interface Job {
  id: string
  assetId: string
  stage: 'UPLOAD' | 'TRANSCODE' | 'PACKAGE' | 'SSAI' | 'DRM' | 'PUBLISH'
  status: 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED'
  message: string | null
  startedAt: string | null
  finishedAt: string | null
  updatedAt: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresInSeconds: number
  refreshExpiresInSeconds: number
  username: string
  role: string
}

export interface MeResponse {
  username: string
  role: string
}

export interface LiveChannel {
  slug: string
  name: string
  description: string
  running: boolean
  startedAt: string
  source: string
  manifestUrl: string
}

export interface CmcdEvent {
  path: string
  timestamp: number
  ingestedAt?: string
  cmcd: Record<string, string | number | boolean>
}

export interface ContinueWatchingItem {
  assetId: string
  title: string
  status: AssetStatus
  positionMs: number
  durationMs: number | null
  updatedAt: string
  spriteUrl: string | null
  posterUrl: string | null
}

export interface WatchProgress {
  assetId: string
  positionMs: number
  durationMs: number | null
  updatedAt: string
}

export interface Rendition {
  tier: string
  width: number
  height: number
  videoBitrateKbps: number
  audioBitrateKbps: number
  vmafScore: number | null
  convexHullOptimal: boolean | null
}

export interface PlaybackSession {
  sessionId: string
  assetId: string
  activeCount: number
  limit: number
}
