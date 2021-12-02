/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { load } from 'js-yaml'
import type { SlideOptions } from '../types/slide-show-options'
import type { NoteFrontmatter } from '../types/note-details'
import { NoteTextDirection, NoteType } from '../types/note-details'
import { ISO6391 } from '../types/iso6391'
import type { RawNoteFrontmatter } from './types'
import { initialSlideOptions } from '../initial-state'

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

/**
 * Creates a new frontmatter metadata instance based on the given raw metadata properties.
 * @param rawData A {@link RawNoteFrontmatter} object containing the properties of the parsed yaml frontmatter.
 */
const parseRawNoteFrontmatter = (rawData: RawNoteFrontmatter): NoteFrontmatter => {
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
    type: rawData.type === NoteType.SLIDE ? NoteType.SLIDE : NoteType.DOCUMENT,
    dir: rawData.dir === NoteTextDirection.LTR ? NoteTextDirection.LTR : NoteTextDirection.RTL,
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
