/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
/**
 * Transforms a given content into an url slug.
 *
 * @param content The content to slugify
 * @return The slugifyed content.
 */
export const tocSlugify = (content: string): string => {
  return encodeURIComponent(content.trim().toLowerCase().replace(/\s+/g, '-'))
}
