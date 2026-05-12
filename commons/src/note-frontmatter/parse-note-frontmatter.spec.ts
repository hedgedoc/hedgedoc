/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, it } from '@jest/globals'
import { parseNoteFrontmatter } from './parse-note-frontmatter.js'

describe('parseNoteFrontmatter', () => {
  it('marks comma-separated tags as deprecated', () => {
    const result = parseNoteFrontmatter('tags: foo, bar')

    expect(result.error).toBeUndefined()
    expect(result.usesDeprecatedTagsFormat).toBe(true)
    expect(result.value?.tags).toStrictEqual(['foo', 'bar'])
  })

  it('does not mark array tags as deprecated', () => {
    const result = parseNoteFrontmatter('tags:\n- foo\n- bar')

    expect(result.error).toBeUndefined()
    expect(result.usesDeprecatedTagsFormat).toBe(false)
    expect(result.value?.tags).toStrictEqual(['foo', 'bar'])
  })
})
