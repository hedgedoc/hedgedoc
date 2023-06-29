/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useBooleanState } from '../../../../../../../hooks/common/use-boolean-state'
import { VersionInfoModal } from '../../../../../../global-dialogs/version-info-modal/version-info-modal'
import { TranslatedDropdownItem } from '../../translated-dropdown-item'
import React, { Fragment } from 'react'
import { Server as IconServer } from 'react-bootstrap-icons'

/**
 * Renders the version info menu entry for the help dropdown.
 */
export const VersionInfoHelpMenuEntry: React.FC = () => {
  const [modalVisibility, showModal, closeModal] = useBooleanState()

  return (
    <Fragment>
      <TranslatedDropdownItem icon={IconServer} i18nKey={'appbar.help.instance.versionInfo'} onClick={showModal} />
      <VersionInfoModal show={modalVisibility} onHide={closeModal} />
    </Fragment>
  )
}
