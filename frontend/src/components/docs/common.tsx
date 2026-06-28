import { ReactNode, JSX } from 'react'

/** Inline chapter link. Clicking changes the hash; the Docs component's
 *  hashchange listener swaps the active slug. */
export function L({ slug, children }: { slug: string; children: ReactNode }) {
  return (
    <a className="docs-chap-link" href={`#/docs/${slug}`}>
      {children}
    </a>
  )
}

export interface Chapter {
  slug: string
  title: string
  blurb: string
  render: () => JSX.Element
}
