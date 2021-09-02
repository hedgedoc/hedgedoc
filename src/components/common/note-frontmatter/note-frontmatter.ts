/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

// import { RevealOptions } from 'reveal.js'
import { load } from 'js-yaml'
import { ISO6391, NoteTextDirection, NoteType, RawNoteFrontmatter } from './types'

/**
 * Class that represents the parsed frontmatter metadata of a note.
 */
export class NoteFrontmatter {
  title: string
  description: string
  tags: string[]
  deprecatedTagsSyntax: boolean
  robots: string
  lang: typeof ISO6391[number]
  dir: NoteTextDirection
  breaks: boolean
  GA: string
  disqus: string
  type: NoteType
  opengraph: Map<string, string>

  /**
   * Creates a new frontmatter metadata instance based on the given raw metadata properties.
   * @param rawData A {@link RawNoteFrontmatter} object containing the properties of the parsed yaml frontmatter.
   */
  constructor(rawData: RawNoteFrontmatter) {
    this.title = rawData.title ?? ''
    this.description = rawData.description ?? ''
    this.robots = rawData.robots ?? ''
    this.breaks = rawData.breaks ?? true
    this.GA = rawData.GA ?? ''
    this.disqus = rawData.disqus ?? ''
    this.lang = (rawData.lang ? ISO6391.find((lang) => lang === rawData.lang) : undefined) ?? 'en'
    this.type =
      (rawData.type ? Object.values(NoteType).find((type) => type === rawData.type) : undefined) ?? NoteType.DOCUMENT
    this.dir =
      (rawData.dir ? Object.values(NoteTextDirection).find((dir) => dir === rawData.dir) : undefined) ??
      NoteTextDirection.LTR
    if (typeof rawData?.tags === 'string') {
      this.tags = rawData?.tags?.split(',').map((entry) => entry.trim()) ?? []
      this.deprecatedTagsSyntax = true
    } else if (typeof rawData?.tags === 'object') {
      this.tags = rawData?.tags?.filter((tag) => tag !== null) ?? []
      this.deprecatedTagsSyntax = false
    } else {
      this.tags = []
      this.deprecatedTagsSyntax = false
    }
    this.opengraph = rawData?.opengraph
      ? new Map<string, string>(Object.entries(rawData.opengraph))
      : new Map<string, string>()
  }

  /**
   * Creates a new frontmatter metadata instance based on a raw yaml string.
   * @param rawYaml The frontmatter content in yaml format.
   * @throws Error when the content string is invalid yaml.
   * @return Frontmatter metadata instance containing the parsed properties from the yaml content.
   */
  static createFromYaml(rawYaml: string): NoteFrontmatter {
    const rawNoteFrontmatter = load(rawYaml) as RawNoteFrontmatter
    return new NoteFrontmatter(rawNoteFrontmatter)
  }
}
