/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useBooleanState } from '../../../hooks/common/use-boolean-state'
import { useOutlineButtonVariant } from '../../../hooks/dark-mode/use-outline-button-variant'
import { useSaveDarkModePreferenceToLocalStorage } from '../../../hooks/dark-mode/use-save-dark-mode-preference-to-local-storage'
import { cypressId } from '../../../utils/cypress-attribute'
import { IconButton } from '../../common/icon-button/icon-button'
import { SettingsModal } from './settings-modal'
import React, { Fragment } from 'react'
import type { ButtonProps } from 'react-bootstrap'
import { Gear as IconGear } from 'react-bootstrap-icons'

export type SettingsButtonProps = Omit<ButtonProps, 'onClick'>
/**
 * Renders a button that opens a settings modal.
 */
export const SettingsButton: React.FC<SettingsButtonProps> = (props) => {
  const [show, showModal, hideModal] = useBooleanState(false)
  const buttonVariant = useOutlineButtonVariant()
  useSaveDarkModePreferenceToLocalStorage()

  return (
    <Fragment>
      <IconButton
        {...props}
        {...cypressId('settingsButton')}
        onClick={showModal}
        icon={IconGear}
        variant={buttonVariant}
      />
      <SettingsModal show={show} onHide={hideModal} />
    </Fragment>
  )
}
