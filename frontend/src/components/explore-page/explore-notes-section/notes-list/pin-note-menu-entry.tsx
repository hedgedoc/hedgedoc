/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback } from 'react'
import { Pin as IconPin, PinFill as IconPinFill } from 'react-bootstrap-icons'
import { Dropdown } from 'react-bootstrap'
import { UiIcon } from '../../../common/icons/ui-icon'
import { Trans } from 'react-i18next'
import { setNotePinStatus } from '../../../../redux/pinned-notes/methods'
import { useUiNotifications } from '../../../notifications/ui-notification-boundary'

export interface PinNoteMenuEntryProps {
  noteAlias: string
  isPinned: boolean
}

export const PinNoteMenuEntry: React.FC<PinNoteMenuEntryProps> = ({ noteAlias, isPinned }) => {
  const { showErrorNotification } = useUiNotifications()

  const onClickPin = useCallback(() => {
    setNotePinStatus(noteAlias, !isPinned).catch(
      showErrorNotification('explore.pinnedNotes.error', { alias: noteAlias })
    )
  }, [noteAlias, isPinned, showErrorNotification])

  return (
    <Dropdown.Item onClick={onClickPin}>
      <UiIcon icon={isPinned ? IconPinFill : IconPin} className='mx-2' />
      <Trans i18nKey={`explore.pinnedNotes.${isPinned ? 'unpin' : 'pin'}`} />
    </Dropdown.Item>
  )
}
