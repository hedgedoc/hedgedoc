/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { Fragment } from 'react'
import { TranslatedDropdownItem } from '../../translated-dropdown-item'
import { InfoCircleFill as IconInfoCircleFill } from 'react-bootstrap-icons'
import { useBooleanState } from '../../../../../../../hooks/common/use-boolean-state'
import { MotdModal } from '../../../../../../global-dialogs/motd-modal/motd-modal'
import { useMotdContextValue } from '../../../../../../motd/motd-context'

/**
 * Help menu entry for the motd modal.
 * When no modal content is defined, the menu entry will not render.
 */
export const MotdModalHelpMenuEntry: React.FC = () => {
  const [modalVisibility, showModal, closeModal] = useBooleanState(false)
  const contextValue = useMotdContextValue()

  if (!contextValue) {
    return null
  }

  return (
    <Fragment>
      <TranslatedDropdownItem
        icon={IconInfoCircleFill}
        i18nKey={'appbar.help.instance.motdModal'}
        onClick={showModal}
      />
      <MotdModal show={modalVisibility} onDismiss={closeModal} />
    </Fragment>
  )
}
