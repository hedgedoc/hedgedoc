/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../../../../hooks/common/use-application-state'
import { useIsNotePinned } from '../../../../../hooks/common/use-is-note-pinned'
import { concatCssClasses } from '../../../../../utils/concat-css-classes'
import { SidebarButton } from '../../sidebar-button/sidebar-button'
import type { SpecificSidebarEntryProps } from '../../types'
import React, { useCallback, useState } from 'react'
import { Pin as IconPin, PinFill as IconPinFill } from 'react-bootstrap-icons'
import { Trans, useTranslation } from 'react-i18next'
import { WaitSpinner } from '../../../../common/wait-spinner/wait-spinner'
import { useUiNotifications } from '../../../../notifications/ui-notification-boundary'
import { setNotePinStatus } from '../../../../../redux/pinned-notes/methods'

/**
 * Sidebar entry button that toggles the pinned status of the current note in the history.
 *
 * @param className CSS classes to add to the sidebar button
 * @param hide true when the sidebar button should be hidden, false otherwise
 */
export const PinNoteSidebarEntry: React.FC<SpecificSidebarEntryProps> = ({ className, hide }) => {
  useTranslation()
  const [loading, setLoading] = useState(false)
  const { showErrorNotificationBuilder } = useUiNotifications()
  const noteAlias = useApplicationState((state) => state.noteDetails?.primaryAlias)
  const isPinned = useIsNotePinned(noteAlias)

  const onPinClicked = useCallback(() => {
    if (!noteAlias) {
      return
    }
    setLoading(true)
    setNotePinStatus(noteAlias, !isPinned)
      .catch(showErrorNotificationBuilder(`explore.pinnedNotes.${isPinned ? 'un' : ''}pinError`, { alias: noteAlias }))
      .finally(() => setLoading(false))
  }, [noteAlias, isPinned, showErrorNotificationBuilder])

  if (loading) {
    return (
      <SidebarButton>
        <WaitSpinner />
        <Trans i18nKey={'common.loading'} />
      </SidebarButton>
    )
  }

  return (
    <SidebarButton icon={isPinned ? IconPinFill : IconPin} hide={hide} onClick={onPinClicked} className={className}>
      <Trans i18nKey={`explore.pinnedNotes.is${isPinned ? 'Pinned' : 'Unpinned'}`} />
    </SidebarButton>
  )
}
