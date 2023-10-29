/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../../../../hooks/common/use-application-state'
import { toggleHistoryEntryPinning } from '../../../../../redux/history/methods'
import { concatCssClasses } from '../../../../../utils/concat-css-classes'
import { useUiNotifications } from '../../../../notifications/ui-notification-boundary'
import { SidebarButton } from '../../sidebar-button/sidebar-button'
import type { SpecificSidebarEntryProps } from '../../types'
import styles from './pin-note-sidebar-entry.module.css'
import React, { useCallback, useMemo, useState } from 'react'
import { Pin as IconPin } from 'react-bootstrap-icons'
import { Trans, useTranslation } from 'react-i18next'
import { WaitSpinner } from '../../../../common/wait-spinner/wait-spinner'

/**
 * Sidebar entry button that toggles the pinned status of the current note in the history.
 *
 * @param className CSS classes to add to the sidebar button
 * @param hide true when the sidebar button should be hidden, false otherwise
 */
export const PinNoteSidebarEntry: React.FC<SpecificSidebarEntryProps> = ({ className, hide }) => {
  useTranslation()
  const [loading, setLoading] = useState(false)
  const noteId = useApplicationState((state) => state.noteDetails?.id)
  const history = useApplicationState((state) => state.history)
  const { showErrorNotification } = useUiNotifications()

  const isPinned = useMemo(() => {
    const entry = history.find((entry) => entry.identifier === noteId)
    if (!entry) {
      return false
    }
    return entry.pinStatus
  }, [history, noteId])

  const onPinClicked = useCallback(() => {
    if (!noteId) {
      return
    }
    setLoading(true)
    toggleHistoryEntryPinning(noteId)
      .catch(showErrorNotification('landing.history.error.updateEntry.text'))
      .finally(() => setLoading(false))
  }, [noteId, setLoading, showErrorNotification])

  if (loading) {
    return (
      <SidebarButton>
        <WaitSpinner />
        <Trans i18nKey={'common.loading'} />
      </SidebarButton>
    )
  }

  return (
    <SidebarButton
      icon={IconPin}
      hide={hide}
      onClick={onPinClicked}
      className={concatCssClasses(className, { [styles['highlighted']]: isPinned })}>
      <Trans i18nKey={isPinned ? 'editor.documentBar.pinnedToHistory' : 'editor.documentBar.pinNoteToHistory'} />
    </SidebarButton>
  )
}
