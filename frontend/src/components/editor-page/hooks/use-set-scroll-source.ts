/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Logger } from '../../../utils/logger'
import type { ScrollSource } from '../editor-page-content'
import type { MutableRefObject } from 'react'
import { useCallback } from 'react'

const log = new Logger('useSetScrollSource')

/**
 * Provides a function that updates the given {@link ScrollSource} reference to a given value.
 *
 * @param scrollSourceReference The reference to update
 * @param targetScrollSource The value that should be set in the reference
 * @return The function that sets the reference
 */
export const useSetScrollSource = (
  scrollSourceReference: MutableRefObject<ScrollSource>,
  targetScrollSource: ScrollSource
) => {
  return useCallback(() => {
    if (scrollSourceReference.current !== targetScrollSource) {
      scrollSourceReference.current = targetScrollSource
      log.debug(`Make ${targetScrollSource} scroll source`)
    }
  }, [scrollSourceReference, targetScrollSource])
}
