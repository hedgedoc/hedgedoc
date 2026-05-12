/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import z from 'zod'
import type { RevealOptions } from 'reveal.js'
import { parseTagsField } from './parse-tags-field.js'
import { NoteType } from './note-type.js'
import { ISO6391 } from './iso6391.js'
import { defaultNoteFrontmatter } from './default-note-frontmatter.js'
import { NoteTextDirection } from './note-text-direction.js'

// Reveal.js provides types but no runtime validation of fields, so we validate them as unknown and accept everything
const slideOptionsSchema = z
  .record(z.unknown())
  .default(defaultNoteFrontmatter.slideOptions)
  .transform((slideOptions) => slideOptions as Partial<RevealOptions>)

export const NoteFrontmatterSchema = z
  .object({
    title: z.coerce.string().default(defaultNoteFrontmatter.title).describe('Title of the note'),
    description: z.coerce
      .string()
      .default(defaultNoteFrontmatter.description)
      .describe('Description of the note'),
    tags: z
      .preprocess(parseTagsField, z.array(z.string()))
      .describe('List of tags for filtering on the explore page')
      .default([]),
    type: z
      .nativeEnum(NoteType)
      .default(defaultNoteFrontmatter.type)
      .describe('Type of the renderer to use'),
    robots: z.string().default(defaultNoteFrontmatter.robots).describe('Robots meta tag'),
    lang: z.enum(ISO6391).default(defaultNoteFrontmatter.lang).describe('Language of the note'),
    dir: z
      .nativeEnum(NoteTextDirection)
      .default(defaultNoteFrontmatter.dir)
      .describe('Text writing direction'),
    breaks: z
      .boolean()
      .default(defaultNoteFrontmatter.breaks)
      .describe('Treat newlines as line break'),
    license: z
      .string()
      .default(defaultNoteFrontmatter.license)
      .describe('License header field to add to the HTML'),
    opengraph: z
      .record(z.coerce.string())
      .default(defaultNoteFrontmatter.opengraph)
      .describe('OpenGraph meta tags'),
    slideOptions: slideOptionsSchema.describe('Reveal.js options for slides'),
  })
  .describe('Frontmatter options parsed by HedgeDoc, others are ignored')
  .passthrough()

export type NoteFrontmatter = z.infer<typeof NoteFrontmatterSchema>
