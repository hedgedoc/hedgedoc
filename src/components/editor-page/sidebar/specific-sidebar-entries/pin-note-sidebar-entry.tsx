/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback, useMemo } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { SidebarButton } from '../sidebar-button/sidebar-button'
import type { SpecificSidebarEntryProps } from '../types'
import { toggleHistoryEntryPinning } from '../../../../redux/history/methods'
import { showErrorNotification } from '../../../../redux/ui-notifications/methods'
import { useApplicationState } from '../../../../hooks/common/use-application-state'

/**
 * Sidebar entry button that toggles the pinned status of the current note in the history.
 *
 * @param className CSS classes to add to the sidebar button
 * @param hide true when the sidebar button should be hidden, false otherwise
 */
export const PinNoteSidebarEntry: React.FC<SpecificSidebarEntryProps> = ({ className, hide }) => {
  useTranslation()
  const id = useApplicationState((state) => state.noteDetails.id)
  const history = useApplicationState((state) => state.history)

  const isPinned = useMemo(() => {
    const entry = history.find((entry) => entry.identifier === id)
    if (!entry) {
      return false
    }
    return entry.pinStatus
  }, [id, history])

  const onPinClicked = useCallback(() => {
    toggleHistoryEntryPinning(id).catch(showErrorNotification('landing.history.error.updateEntry.text'))
  }, [id])

  return (
    <SidebarButton
      icon={'thumb-tack'}
      hide={hide}
      onClick={onPinClicked}
      className={`${className ?? ''} ${isPinned ? 'icon-highlighted' : ''}`}>
      <Trans i18nKey={isPinned ? 'editor.documentBar.pinnedToHistory' : 'editor.documentBar.pinNoteToHistory'} />
    </SidebarButton>
  )
}
