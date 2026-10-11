/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useOutlineButtonVariant } from '../../../hooks/dark-mode/use-outline-button-variant'
import { IconButton } from '../../common/icon-button/icon-button'
import React from 'react'
import type { ButtonProps } from 'react-bootstrap'
import { Gear as IconGear } from 'react-bootstrap-icons'
import Link from 'next/link'

type SettingsButtonProps = Omit<ButtonProps, 'onClick'>

/**
 * Renders a button that opens a settings modal.
 */
export const SettingsButton: React.FC<SettingsButtonProps> = (props) => {
  const buttonVariant = useOutlineButtonVariant()

  return (
    <Link href={'/preferences/appearance'} passHref={true} legacyBehavior={true}>
      <IconButton {...props} icon={IconGear} variant={buttonVariant} />
    </Link>
  )
}
