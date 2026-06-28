import { Group } from './glossary.types'
import { GROUPS_FOUNDATIONS } from './glossary.groups.foundations'
import { GROUPS_OPS } from './glossary.groups.ops'

export type { Group, Term } from './glossary.types'

// Glossary terms grouped by domain area. Split into Foundations
// (Domain, Distribution, Streaming, Live, Codec, Audio) and Ops
// (Ads, Security, Captions, Quality, Toolchain) to keep each data
// file under the 300-line threshold; the JSX renderer in
// Glossary.tsx still iterates a single combined array.
export const GROUPS: Group[] = [...GROUPS_FOUNDATIONS, ...GROUPS_OPS]
