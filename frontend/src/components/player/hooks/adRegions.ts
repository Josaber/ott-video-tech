import { AdRegion } from './useAdGuard'

const EPOCH_0 = new Date('1970-01-01T00:00:00.000Z').getTime()

export type DateRangeMap = Record<string, { duration?: number; startDate?: Date | string }>

/**
 * Parse hls.js's normalized `dateRanges` payload — used by both the
 * MANIFEST_PARSED event and the modern (v1.5+) LEVEL_LOADED path.
 */
export function parseDateRanges(dateRanges: DateRangeMap | undefined): AdRegion[] {
  if (!dateRanges) return []
  const regions: AdRegion[] = []
  for (const id of Object.keys(dateRanges)) {
    const dr = dateRanges[id]
    const dur = dr?.duration ?? 0
    if (dur <= 0) continue
    const sd = dr?.startDate ? new Date(dr.startDate as Date | string).getTime() : EPOCH_0
    const start = Math.max(0, (sd - EPOCH_0) / 1000)
    regions.push({ start, end: start + dur, id })
  }
  regions.sort((a, b) => a.start - b.start)
  return regions
}

/**
 * Legacy fallback: scrape EXT-X-DATERANGE tags off the fragments' tagList.
 * Used when hls.js hasn't normalized them yet (pre v1.5).
 */
export function parseDateRangeTags(fragments: { tagList?: string[][] }[]): AdRegion[] {
  const tags = fragments.flatMap((f) => f.tagList ?? [])
      .filter((t) => Array.isArray(t) && t[0] === 'EXT-X-DATERANGE')
  const regions: AdRegion[] = []
  for (const t of tags) {
    const body = t[1] ?? ''
    const idMatch = /ID="([^"]+)"/.exec(body)
    const startMatch = /START-DATE="([^"]+)"/.exec(body)
    const durMatch = /DURATION=([0-9.]+)/.exec(body)
    if (!durMatch) continue
    const dur = parseFloat(durMatch[1])
    if (dur <= 0) continue
    const id = idMatch ? idMatch[1] : `ad-${regions.length}`
    const start = startMatch ? Math.max(0, (new Date(startMatch[1]).getTime() - EPOCH_0) / 1000) : 0
    regions.push({ start, end: start + dur, id })
  }
  regions.sort((a, b) => a.start - b.start)
  return regions
}
