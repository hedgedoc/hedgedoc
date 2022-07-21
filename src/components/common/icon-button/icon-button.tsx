/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import type { ButtonProps } from 'react-bootstrap'
import { Button } from 'react-bootstrap'
import { ForkAwesomeIcon } from '../fork-awesome/fork-awesome-icon'
import type { IconName } from '../fork-awesome/types'
import { ShowIf } from '../show-if/show-if'
import styles from './icon-button.module.scss'
import type { PropsWithDataTestId } from '../../../utils/test-id'
import { testId } from '../../../utils/test-id'

export interface IconButtonProps extends ButtonProps, PropsWithDataTestId {
  icon: IconName
  onClick?: () => void
  border?: boolean
  iconFixedWidth?: boolean
}

/**
 * A generic {@link Button button} with an {@link ForkAwesomeIcon icon} in it.
 *
 * @param icon Which icon should be used
 * @param children The children that will be added as the content of the button.
 * @param iconFixedWidth If the icon should be of fixed width.
 * @param border Should the button have a border.
 * @param className Additional class names added to the button.
 * @param props Additional props for the button.
 */
export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  children,
  iconFixedWidth = false,
  border = false,
  className,
  ...props
}) => {
  return (
    <Button
      {...props}
      className={`${styles['btn-icon']} p-0 d-inline-flex align-items-stretch ${border ? styles['with-border'] : ''} ${
        className ?? ''
      }`}
      {...testId('icon-button')}>
      <span className={`${styles['icon-part']} d-flex align-items-center`}>
        <ForkAwesomeIcon icon={icon} fixedWidth={iconFixedWidth} className={'icon'} />
      </span>
      <ShowIf condition={!!children}>
        <span className={`${styles['text-part']} d-flex align-items-center`}>{children}</span>
      </ShowIf>
    </Button>
  )
}
