/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../../../../hooks/common/use-application-state'
import { concatCssClasses } from '../../../../../utils/concat-css-classes'
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
  const noteAlias = useApplicationState((state) => state.noteDetails?.primaryAlias)

  const isPinned = useMemo(() => {
    // TODO Fix this when implementing the explore page
    return false
  }, [])

  const onPinClicked = useCallback(() => {
    if (!noteAlias) {
      return
    }
    setLoading(true)
  }, [noteAlias, setLoading])

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
