/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { NoteFrontmatter } from '../note-frontmatter/index.js'
import { parseTags } from './parse-tags.js'
import { RawNoteFrontmatter } from './types.js'

/**
 * Creates a new frontmatter metadata instance based on the given raw metadata properties.
 * @param rawData A {@link RawNoteFrontmatter} object containing the properties of the parsed yaml frontmatter.
 */
export const convertRawFrontmatterToNoteFrontmatter = (
  rawData: RawNoteFrontmatter,
): NoteFrontmatter => {
  return {
    title: rawData.title,
    description: rawData.description,
    robots: rawData.robots,
    newlinesAreBreaks: rawData.breaks,
    lang: rawData.lang,
    type: rawData.type,
    dir: rawData.dir,
    opengraph: rawData.opengraph,
    slideOptions: rawData.slideOptions,
    license: rawData.license,
    tags: parseTags(rawData.tags),
  }
}
