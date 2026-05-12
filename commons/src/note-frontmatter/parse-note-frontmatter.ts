/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { load } from 'js-yaml'
import { type NoteFrontmatter, NoteFrontmatterSchema } from './note-frontmatter.js'

export type NoteFrontmatterParserResult =
  | {
      error: undefined
      value: NoteFrontmatter
      usesDeprecatedTagsFormat: boolean
      rawTagsField: unknown
    }
  | {
      error: Error
      value: undefined
      usesDeprecatedTagsFormat: boolean
      rawTagsField: unknown
    }

/**
 * Parses the note frontmatter from the given YAML string and returns the parsed result with collected errors.
 *
 * @param rawYaml The raw YAML string to parse
 * @returns A wrapper containing the parsed note frontmatter and an error in case parsing failed
 */
export const parseNoteFrontmatter = (rawYaml: string): NoteFrontmatterParserResult => {
  try {
    const rawNoteFrontmatter = load(rawYaml)
    const rawNoteFrontmatterRecord =
      typeof rawNoteFrontmatter === 'object' &&
      rawNoteFrontmatter !== null &&
      !Array.isArray(rawNoteFrontmatter)
        ? (rawNoteFrontmatter as Record<string, unknown>)
        : undefined
    const rawTagsField = rawNoteFrontmatterRecord?.tags
    const usesDeprecatedTagsFormat =
      rawNoteFrontmatterRecord !== undefined &&
      Object.hasOwn(rawNoteFrontmatterRecord, 'tags') &&
      !Array.isArray(rawNoteFrontmatterRecord.tags)
    if (
      typeof rawNoteFrontmatter !== 'object' ||
      rawNoteFrontmatter === null ||
      Array.isArray(rawNoteFrontmatter) ||
      Object.keys(rawNoteFrontmatter).length === 0
    ) {
      return {
        error: new Error('Invalid YAML'),
        value: undefined,
        usesDeprecatedTagsFormat: false,
        rawTagsField: undefined,
      }
    }
    const parsedNoteFrontmatter = NoteFrontmatterSchema.safeParse(rawNoteFrontmatter)
    if (!parsedNoteFrontmatter.success) {
      return {
        error: parsedNoteFrontmatter.error,
        value: undefined,
        usesDeprecatedTagsFormat,
        rawTagsField: rawTagsField,
      }
    }
    return {
      error: undefined,
      value: parsedNoteFrontmatter.data,
      usesDeprecatedTagsFormat,
      rawTagsField: rawTagsField,
    }
  } catch (error: unknown) {
    return {
      error: error as Error,
      value: undefined,
      usesDeprecatedTagsFormat: false,
      rawTagsField: undefined,
    }
  }
}
