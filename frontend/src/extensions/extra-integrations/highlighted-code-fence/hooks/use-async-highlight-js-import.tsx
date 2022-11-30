/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Logger } from '../../../../utils/logger'
import type { HLJSApi } from 'highlight.js'
import { useAsync } from 'react-use'
import type { AsyncState } from 'react-use/lib/useAsyncFn'

const log = new Logger('HighlightedCode')

/**
 * Lazy loads the highlight js library.
 *
 * @return the loaded js lib
 */
export const useAsyncHighlightJsImport = (): AsyncState<HLJSApi> => {
  return useAsync(async () => {
    try {
      return (await import(/* webpackChunkName: "highlight.js" */ '../preconfigured-highlight-js')).default
    } catch (error) {
      log.error('Error while loading highlight.js', error)
      throw error
    }
  }, [])
}
