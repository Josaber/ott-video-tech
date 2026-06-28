import { Chapter } from '../common'
import { Glossary } from '../../Glossary'

export const chapter: Chapter = {
  slug: 'glossary',
  title: 'Glossary',
  blurb: 'Every OTT term used in this codebase, grouped by topic.',
  render: () => <Glossary />,
}
