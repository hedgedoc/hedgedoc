/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const tocSlugify = (content: string): string => {
  return encodeURIComponent(content.trim().toLowerCase().replace(/\s+/g, '-'))
}
