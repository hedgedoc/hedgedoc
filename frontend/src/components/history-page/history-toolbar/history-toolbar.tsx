/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { HistoryEntryOrigin } from '../../../api/history/types'
import { useApplicationState } from '../../../hooks/common/use-application-state'
import { useTranslatedText } from '../../../hooks/common/use-translated-text'
import { importHistoryEntries, setHistoryEntries } from '../../../redux/history/methods'
import { UiIcon } from '../../common/icons/ui-icon'
import { useUiNotifications } from '../../notifications/ui-notification-boundary'
import { ClearHistoryButton } from './clear-history-button'
import { ExportHistoryButton } from './export-history-button'
import { HistoryRefreshButton } from './history-refresh-button'
import { HistoryViewModeToggleButton } from './history-view-mode-toggle-button'
import { useSafeRefreshHistoryStateCallback } from './hooks/use-safe-refresh-history-state'
import { ImportHistoryButton } from './import-history-button'
import { KeywordSearchInput } from './keyword-search-input'
import { SortByLastVisitedButton } from './sort-by-last-visited-button'
import { SortByTitleButton } from './sort-by-title-button'
import { TagSelectionInput } from './tag-selection-input'
import { useSyncToolbarStateToUrlEffect } from './toolbar-context/use-sync-toolbar-state-to-url-effect'
import React, { useCallback } from 'react'
import { Button, Col } from 'react-bootstrap'
import { CloudUpload as IconCloudUpload } from 'react-bootstrap-icons'
import { useIsLoggedIn } from '../../../hooks/common/use-is-logged-in'

export enum ViewStateEnum {
  CARD,
  TABLE
}

/**
 * Renders the toolbar for the history page that contains controls for filtering and sorting.
 */
export const HistoryToolbar: React.FC = () => {
  const historyEntries = useApplicationState((state) => state.history)
  const userExists = useIsLoggedIn()
  const { showErrorNotification } = useUiNotifications()
  const safeRefreshHistoryState = useSafeRefreshHistoryStateCallback()
  useSyncToolbarStateToUrlEffect()

  const onUploadAllToRemote = useCallback(() => {
    if (!userExists) {
      return
    }
    const localEntries = historyEntries
      .filter((entry) => entry.origin === HistoryEntryOrigin.LOCAL)
      .map((entry) => entry.identifier)
    historyEntries.forEach((entry) => (entry.origin = HistoryEntryOrigin.REMOTE))
    importHistoryEntries(historyEntries).catch((error: Error) => {
      showErrorNotification('landing.history.error.setHistory.text')(error)
      historyEntries.forEach((entry) => {
        if (localEntries.includes(entry.identifier)) {
          entry.origin = HistoryEntryOrigin.LOCAL
        }
      })
      setHistoryEntries(historyEntries)
      safeRefreshHistoryState()
    })
  }, [userExists, historyEntries, showErrorNotification, safeRefreshHistoryState])

  const uploadAllButtonTitle = useTranslatedText('landing.history.toolbar.uploadAll')

  return (
    <Col className={'d-flex flex-row flex-wrap'}>
      <div className={'me-1 mb-1'}>
        <TagSelectionInput />
      </div>
      <div className={'me-1 mb-1'}>
        <KeywordSearchInput />
      </div>
      <div className={'me-1 mb-1'}>
        <SortByTitleButton />
      </div>
      <div className={'me-1 mb-1'}>
        <SortByLastVisitedButton />
      </div>
      <div className={'me-1 mb-1'}>
        <ExportHistoryButton />
      </div>
      <div className={'me-1 mb-1'}>
        <ImportHistoryButton />
      </div>
      <div className={'me-1 mb-1'}>
        <ClearHistoryButton />
      </div>
      <div className={'me-1 mb-1'}>
        <HistoryRefreshButton />
      </div>
      {userExists && (
        <div className={'me-1 mb-1'}>
          <Button variant={'secondary'} title={uploadAllButtonTitle} onClick={onUploadAllToRemote}>
            <UiIcon icon={IconCloudUpload} />
          </Button>
        </div>
      )}
      <div className={'me-1 mb-1'}>
        <HistoryViewModeToggleButton />
      </div>
    </Col>
  )
}
