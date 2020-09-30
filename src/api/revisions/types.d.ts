export interface Revision {
  content: string
  timestamp: number
  authors: string[]
}

export interface RevisionListEntry {
  timestamp: number
  length: number
  authors: string[]
}
