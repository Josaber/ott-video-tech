import { authedFetch, jsonOrThrow } from './http'
import type { LiveChannel } from './types'

export const liveApi = {
  // Unauthenticated — the channel list is public, see SecurityConfig.
  liveChannels: () =>
    fetch('/api/live/channels').then((r) => r.json() as Promise<LiveChannel[]>),
  liveStart: () =>
    authedFetch('/api/live/start', { method: 'POST' }).then(jsonOrThrow<{ running: boolean }>),
  liveStop: () =>
    authedFetch('/api/live/stop', { method: 'POST' }).then(jsonOrThrow<{ running: boolean }>),
}
