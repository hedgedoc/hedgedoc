/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useHistoryToolbarState } from './use-history-toolbar-state'
import equal from 'fast-deep-equal'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Pushes the current search and tag selection into the navigation history stack of the browser.
 */
export const useSyncToolbarStateToUrlEffect = (): void => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [state] = useHistoryToolbarState()
  const pathname = usePathname()

  useEffect(() => {
    if (!searchParams || !pathname) {
      return
    }

    const urlParameterSearch = searchParams.get('search') ?? ''
    const urlParameterSelectedTags = searchParams.getAll('selectedTags')
    const params = new URLSearchParams(searchParams.toString())
    let shouldUpdate = false

    if (!equal(state.search, urlParameterSearch)) {
      if (!state.search) {
        params.delete('search')
      } else {
        params.set('search', state.search)
      }
      shouldUpdate = true
    }
    if (!equal(state.selectedTags, urlParameterSelectedTags)) {
      params.delete('selectedTags')
      state.selectedTags.forEach((tag) => params.append('selectedTags', tag))
      shouldUpdate = true
    }

    if (shouldUpdate) {
      router.push(`${pathname}?${params.toString()}`)
    }
  }, [state, router, searchParams, pathname])
}
