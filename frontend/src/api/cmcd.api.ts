import { authedFetch, jsonOrThrow } from './http'
import type { CmcdEvent } from './types'

export const cmcdApi = {
  cmcdRecent: () =>
    authedFetch('/api/cmcd/recent').then(jsonOrThrow<CmcdEvent[]>),
}
