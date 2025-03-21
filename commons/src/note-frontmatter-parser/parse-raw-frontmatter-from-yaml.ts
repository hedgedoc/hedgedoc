/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { defaultNoteFrontmatter } from '../note-frontmatter/index.js'
import {
  NoteTextDirection,
  NoteType,
  OpenGraph,
} from '../note-frontmatter/index.js'
import { SlideOptions } from '../note-frontmatter/index.js'
import { ISO6391 } from '../note-frontmatter/iso6391.js'
import type { RawNoteFrontmatter } from './types.js'
import type { ValidationError } from 'joi'
import Joi from 'joi'
import { load } from 'js-yaml'

const schema = Joi.object<RawNoteFrontmatter>({
  title: Joi.string().optional().default(defaultNoteFrontmatter.title),
  description: Joi.string()
    .optional()
    .default(defaultNoteFrontmatter.description),
  tags: Joi.alternatives(
    Joi.array().items(Joi.string()),
    Joi.string(),
    Joi.number().cast('string'),
  )
    .optional()
    .default(defaultNoteFrontmatter.tags),
  robots: Joi.string().optional().default(defaultNoteFrontmatter.robots),
  lang: Joi.string()
    .valid(...ISO6391)
    .lowercase()
    .optional()
    .default(defaultNoteFrontmatter.lang),
  dir: Joi.string()
    .valid(...Object.values(NoteTextDirection))
    .optional()
    .default(defaultNoteFrontmatter.dir),
  breaks: Joi.boolean()
    .optional()
    .default(defaultNoteFrontmatter.newlinesAreBreaks),
  license: Joi.string().optional().default(defaultNoteFrontmatter.license),
  type: Joi.string()
    .valid(...Object.values(NoteType))
    .optional()
    .default(defaultNoteFrontmatter.type),
  slideOptions: Joi.object<SlideOptions>({
    autoSlide: Joi.number().optional(),
    transition: Joi.string().optional(),
    backgroundTransition: Joi.string().optional(),
    autoSlideStoppable: Joi.boolean().optional(),
    slideNumber: Joi.boolean().optional(),
  })
    .optional()
    .default(defaultNoteFrontmatter.slideOptions),
  opengraph: Joi.object<OpenGraph>({
    title: Joi.string().optional(),
    image: Joi.string().uri().optional(),
  })
    .unknown(true)
    .optional()
    .default(defaultNoteFrontmatter.opengraph),
})
  .default(defaultNoteFrontmatter)
  .unknown(true)

type ParserResult =
  | {
      error: undefined
      warning?: ValidationError
      value: RawNoteFrontmatter
    }
  | {
      error: Error
      warning?: ValidationError
      value: undefined
    }

export const parseRawFrontmatterFromYaml = (rawYaml: string): ParserResult => {
  try {
    const rawNoteFrontmatter = load(rawYaml)
    return schema.validate(rawNoteFrontmatter, { convert: true })
  } catch {
    return { error: new Error('Invalid YAML'), value: undefined }
  }
}
