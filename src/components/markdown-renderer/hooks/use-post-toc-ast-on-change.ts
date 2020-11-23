/*
 * SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import equal from 'fast-deep-equal'
import { RefObject, useEffect, useRef } from 'react'
import { TocAst } from 'markdown-it-toc-done-right'

export const usePostTocAstOnChange = (tocAst: RefObject<TocAst|undefined>, onTocChange?: (ast: TocAst) => void): void => {
  const lastTocAst = useRef<TocAst>()
  useEffect(() => {
    if (onTocChange && tocAst.current && !equal(tocAst, lastTocAst.current)) {
      lastTocAst.current = tocAst.current
      onTocChange(tocAst.current)
    }
  }, [onTocChange, tocAst])
}
