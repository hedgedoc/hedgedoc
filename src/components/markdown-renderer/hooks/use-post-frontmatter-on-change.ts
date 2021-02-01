/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import equal from 'fast-deep-equal'
import { useEffect, useRef } from 'react'
import { NoteFrontmatter, RawNoteFrontmatter } from '../../editor/note-frontmatter/note-frontmatter'

export const usePostFrontmatterOnChange = (
  rawFrontmatter: RawNoteFrontmatter | undefined,
  firstHeadingRef: string | undefined,
  onFrontmatterChange?: (frontmatter: NoteFrontmatter | undefined) => void,
  onFirstHeadingChange?: (firstHeading: string | undefined) => void
): void => {
  const oldMetaRef = useRef<RawNoteFrontmatter>()
  const oldFirstHeadingRef = useRef<string>()

  useEffect(() => {
    if (onFrontmatterChange && !equal(oldMetaRef.current, rawFrontmatter)) {
      if (rawFrontmatter) {
        const newFrontmatter = new NoteFrontmatter(rawFrontmatter)
        onFrontmatterChange(newFrontmatter)
      } else {
        onFrontmatterChange(undefined)
      }
      oldMetaRef.current = rawFrontmatter
    }
    if (onFirstHeadingChange && !equal(firstHeadingRef, oldFirstHeadingRef.current)) {
      onFirstHeadingChange(firstHeadingRef || undefined)
      oldFirstHeadingRef.current = firstHeadingRef
    }
  })
}
