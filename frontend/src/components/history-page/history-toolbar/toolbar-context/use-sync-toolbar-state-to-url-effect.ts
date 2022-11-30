/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useArrayStringUrlParameter } from '../../../../hooks/common/use-array-string-url-parameter'
import { useSingleStringUrlParameter } from '../../../../hooks/common/use-single-string-url-parameter'
import { Logger } from '../../../../utils/logger'
import { useHistoryToolbarState } from './use-history-toolbar-state'
import equal from 'fast-deep-equal'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

const logger = new Logger('useSyncToolbarStateToUrl')

/**
 * Pushes the current search and tag selection into the navigation history stack of the browser.
 */
export const useSyncToolbarStateToUrlEffect = (): void => {
  const router = useRouter()
  const urlParameterSearch = useSingleStringUrlParameter('search', '')
  const urlParameterSelectedTags = useArrayStringUrlParameter('selectedTags')
  const [state] = useHistoryToolbarState()

  useEffect(() => {
    if (!equal(state.search, urlParameterSearch) || !equal(state.selectedTags, urlParameterSelectedTags)) {
      router
        .push(
          {
            pathname: router.pathname,
            query: {
              search: state.search === '' ? [] : state.search,
              selectedTags: state.selectedTags
            }
          },
          undefined,
          {
            shallow: true
          }
        )
        .catch(() => logger.error("Can't update route"))
    }
  }, [state, router, urlParameterSearch, urlParameterSelectedTags])
}
