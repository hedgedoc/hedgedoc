/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { initialSlideOptions, initialState } from '../initial-state'
import type { RawNoteFrontmatter } from './types'
import type { Iso6391Language, NoteFrontmatter, OpenGraph, SlideOptions } from '@hedgedoc/commons'
import { ISO6391, NoteTextDirection, NoteType } from '@hedgedoc/commons'
import Joi from 'joi'
import { load } from 'js-yaml'

/**
 * Creates a new frontmatter metadata instance based on a raw yaml string.
 * @param rawYaml The frontmatter content in yaml format.
 * @throws Error when the content string is invalid yaml.
 * @return Frontmatter metadata instance containing the parsed properties from the yaml content.
 */
export const createNoteFrontmatterFromYaml = (rawYaml: string): NoteFrontmatter => {
  const rawNoteFrontmatter = load(rawYaml) as RawNoteFrontmatter
  return parseRawNoteFrontmatter(validateRawNoteFrontmatter(rawNoteFrontmatter))
}

/**
 * Creates a new frontmatter metadata instance based on the given raw metadata properties.
 * @param rawData A {@link RawNoteFrontmatter} object containing the properties of the parsed yaml frontmatter.
 */
const parseRawNoteFrontmatter = (rawData: RawNoteFrontmatter): NoteFrontmatter => {
  let tags: string[]
  if (typeof rawData?.tags === 'string') {
    tags = rawData?.tags?.split(',').map((entry) => entry.trim()) ?? []
  } else if (typeof rawData?.tags === 'object') {
    tags = rawData?.tags?.filter((tag) => tag !== null) ?? []
  } else {
    tags = [...initialState.frontmatter.tags]
  }

  return {
    title: rawData.title ?? initialState.frontmatter.title,
    description: rawData.description ?? initialState.frontmatter.description,
    robots: rawData.robots ?? initialState.frontmatter.robots,
    newlinesAreBreaks: parseBoolean(rawData.breaks) ?? initialState.frontmatter.newlinesAreBreaks,
    GA: rawData.GA ?? initialState.frontmatter.GA,
    disqus: rawData.disqus ?? initialState.frontmatter.disqus,
    lang: parseLanguage(rawData),
    type: parseNoteType(rawData),
    dir: parseTextDirection(rawData),
    opengraph: parseOpenGraph(rawData),
    slideOptions: parseSlideOptions(rawData),
    license: rawData.license ?? initialState.frontmatter.license,
    tags
  }
}

/**
 * Schema for the {@link RawNoteFrontmatter} for runtime validation.
 */
const RawNoteFrontmatterSchema = Joi.object({
  title: Joi.string().optional().allow(null),
  description: Joi.string().optional(),
  tags: Joi.alternatives(Joi.string(), Joi.number(), Joi.array().items(Joi.string())).optional(),
  robots: Joi.string().optional(),
  lang: Joi.string().optional(),
  dir: Joi.string().optional(),
  breaks: Joi.boolean().optional(),
  GA: Joi.string().optional(),
  disqus: Joi.string().optional(),
  license: Joi.string().optional(),
  type: Joi.string().optional(),
  slideOptions: Joi.object().allow(null).pattern(/.*/, Joi.string().allow('')),
  opengraph: Joi.object().allow(null).pattern(/.*/, Joi.string().allow(''))
})

/**
 * Validates the given raw data against the {@link RawNoteFrontmatterSchema}.
 *
 * @param rawData The raw data to validate.
 * @returns The validated raw data.
 * @throws Error when the validation fails.
 */
const validateRawNoteFrontmatter = (rawData: unknown): RawNoteFrontmatter => {
  const validation = RawNoteFrontmatterSchema.validate(rawData)
  if (validation.error) {
    throw new Error(validation.error.message)
  }
  return validation.value as RawNoteFrontmatter
}

/**
 * Parses the {@link OpenGraph open graph} from the {@link RawNoteFrontmatter}.
 *
 * @param rawData The raw note frontmatter data.
 * @return the parsed {@link OpenGraph open graph}
 */
const parseOpenGraph = (rawData: RawNoteFrontmatter): OpenGraph => {
  return { ...(rawData.opengraph ?? initialState.frontmatter.opengraph) }
}

/**
 * Parses the {@link Iso6391Language iso 6391 language code} from the {@link RawNoteFrontmatter}.
 *
 * @param rawData The raw note frontmatter data.
 * @return the parsed {@link Iso6391Language iso 6391 language code}
 */
const parseLanguage = (rawData: RawNoteFrontmatter): Iso6391Language => {
  return (rawData.lang ? ISO6391.find((lang) => lang === rawData.lang) : undefined) ?? initialState.frontmatter.lang
}

/**
 * Parses the {@link NoteType note type} from the {@link RawNoteFrontmatter}.
 *
 * @param rawData The raw note frontmatter data.
 * @return the parsed {@link NoteType note type}
 */
const parseNoteType = (rawData: RawNoteFrontmatter): NoteType => {
  return rawData.type !== undefined
    ? rawData.type === NoteType.SLIDE
      ? NoteType.SLIDE
      : NoteType.DOCUMENT
    : initialState.frontmatter.type
}

/**
 * Parses the {@link NoteTextDirection note text direction} from the {@link RawNoteFrontmatter}.
 *
 * @param rawData The raw note frontmatter data.
 * @return the parsed {@link NoteTextDirection note text direction}
 */
const parseTextDirection = (rawData: RawNoteFrontmatter): NoteTextDirection => {
  return rawData.dir !== undefined
    ? rawData.dir === NoteTextDirection.LTR
      ? NoteTextDirection.LTR
      : NoteTextDirection.RTL
    : initialState.frontmatter.dir
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
