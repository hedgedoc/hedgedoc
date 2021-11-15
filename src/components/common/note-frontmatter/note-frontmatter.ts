/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

// import { RevealOptions } from 'reveal.js'
import { load } from 'js-yaml'
import type { RawNoteFrontmatter, SlideOptions } from './types'
import { ISO6391, NoteTextDirection, NoteType } from './types'
import { initialSlideOptions } from '../../../redux/note-details/initial-state'

/**
 * Class that represents the parsed frontmatter metadata of a note.
 */
export interface NoteFrontmatter {
  title: string
  description: string
  tags: string[]
  deprecatedTagsSyntax: boolean
  robots: string
  lang: typeof ISO6391[number]
  dir: NoteTextDirection
  newlinesAreBreaks: boolean
  GA: string
  disqus: string
  type: NoteType
  opengraph: Map<string, string>
  slideOptions: SlideOptions
}

/**
 * Creates a new frontmatter metadata instance based on the given raw metadata properties.
 * @param rawData A {@link RawNoteFrontmatter} object containing the properties of the parsed yaml frontmatter.
 */
export const parseRawNoteFrontmatter = (rawData: RawNoteFrontmatter): NoteFrontmatter => {
  let tags: string[]
  let deprecatedTagsSyntax: boolean
  if (typeof rawData?.tags === 'string') {
    tags = rawData?.tags?.split(',').map((entry) => entry.trim()) ?? []
    deprecatedTagsSyntax = true
  } else if (typeof rawData?.tags === 'object') {
    tags = rawData?.tags?.filter((tag) => tag !== null) ?? []
    deprecatedTagsSyntax = false
  } else {
    tags = []
    deprecatedTagsSyntax = false
  }

  return {
    title: rawData.title ?? '',
    description: rawData.description ?? '',
    robots: rawData.robots ?? '',
    newlinesAreBreaks: rawData.breaks ?? true,
    GA: rawData.GA ?? '',
    disqus: rawData.disqus ?? '',
    lang: (rawData.lang ? ISO6391.find((lang) => lang === rawData.lang) : undefined) ?? 'en',
    type:
      (rawData.type ? Object.values(NoteType).find((type) => type === rawData.type) : undefined) ?? NoteType.DOCUMENT,
    dir:
      (rawData.dir ? Object.values(NoteTextDirection).find((dir) => dir === rawData.dir) : undefined) ??
      NoteTextDirection.LTR,
    opengraph: rawData?.opengraph
      ? new Map<string, string>(Object.entries(rawData.opengraph))
      : new Map<string, string>(),

    slideOptions: parseSlideOptions(rawData),
    tags,
    deprecatedTagsSyntax
  }
}

/**
 * Parses the {@link SlideOptions} from the {@link RawNoteFrontmatter}.
 *
 * @param rawData The raw note frontmatter data.
 * @return the parsed slide options
 */
const parseSlideOptions = (rawData: RawNoteFrontmatter): SlideOptions => {
  const rawSlideOptions = rawData?.slideOptions
  return {
    autoSlide: parseNumber(rawSlideOptions?.autoSlide) ?? initialSlideOptions.autoSlide,
    transition: rawSlideOptions?.transition ?? initialSlideOptions.transition,
    backgroundTransition: rawSlideOptions?.backgroundTransition ?? initialSlideOptions.backgroundTransition,
    autoSlideStoppable: parseBoolean(rawSlideOptions?.autoSlideStoppable) ?? initialSlideOptions.autoSlideStoppable,
    slideNumber: parseBoolean(rawSlideOptions?.slideNumber) ?? initialSlideOptions.slideNumber
  }
}

/**
 * Parses an unknown variable into a boolean.
 *
 * @param rawData The raw data
 * @return The parsed boolean or undefined if it's not possible to parse the data.
 */
const parseBoolean = (rawData: unknown | undefined): boolean | undefined => {
  return rawData === undefined ? undefined : rawData === true
}

/**
 * Parses an unknown variable into a number.
 *
 * @param rawData The raw data
 * @return The parsed number or undefined if it's not possible to parse the data.
 */
const parseNumber = (rawData: unknown | undefined): number | undefined => {
  if (rawData === undefined) {
    return undefined
  }
  const numValue = Number(rawData)
  return isNaN(numValue) ? undefined : numValue
}

/**
 * Creates a new frontmatter metadata instance based on a raw yaml string.
 * @param rawYaml The frontmatter content in yaml format.
 * @throws Error when the content string is invalid yaml.
 * @return Frontmatter metadata instance containing the parsed properties from the yaml content.
 */
export const createNoteFrontmatterFromYaml = (rawYaml: string): NoteFrontmatter => {
  const rawNoteFrontmatter = load(rawYaml) as RawNoteFrontmatter
  return parseRawNoteFrontmatter(rawNoteFrontmatter)
}
