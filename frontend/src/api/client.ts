// Public surface of the API layer.
//
// Domain endpoints live in `*.api.ts` siblings; this file's only job is
// to (a) re-export the wire types so callers can `import type { Asset }`
// from one place, and (b) merge each domain module into a single `api`
// object so existing call sites like `api.list()` / `api.listSeries()`
// keep working unchanged after the split.

export type {
  Asset,
  AssetStatus,
  EditorialState,
  Series,
  Season,
  Job,
  LoginResponse,
  MeResponse,
  LiveChannel,
  CmcdEvent,
  ContinueWatchingItem,
  WatchProgress,
  Rendition,
  PlaybackSession,
} from './types'

import { authApi } from './auth.api'
import { assetApi } from './asset.api'
import { catalogApi } from './catalog.api'
import { playbackApi } from './playback.api'
import { progressApi } from './progress.api'
import { cmcdApi } from './cmcd.api'
import { liveApi } from './live.api'

export const api = {
  ...authApi,
  ...assetApi,
  ...catalogApi,
  ...playbackApi,
  ...progressApi,
  ...cmcdApi,
  ...liveApi,
}
