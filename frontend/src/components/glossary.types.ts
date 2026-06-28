export interface Term {
  abbr: string
  full: string
  note: string
}

export interface Group {
  label: string
  items: Term[]
}
