/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { Fragment } from 'react'
import { useBooleanState } from '../../../hooks/common/use-boolean-state'
import { IconButton } from '../../common/icon-button/icon-button'
import { SettingsModal } from './settings-modal'
import type { ButtonProps } from 'react-bootstrap'
import { cypressId } from '../../../utils/cypress-attribute'

export type SettingsButtonProps = Omit<ButtonProps, 'onClick'>
/**
 * Renders a button that opens a settings modal.
 */
export const SettingsButton: React.FC<SettingsButtonProps> = (props) => {
  const [show, showModal, hideModal] = useBooleanState(false)
  return (
    <Fragment>
      <IconButton {...props} {...cypressId('settingsButton')} onClick={showModal} icon={'cog'} />
      <SettingsModal show={show} onHide={hideModal} />
    </Fragment>
  )
}
