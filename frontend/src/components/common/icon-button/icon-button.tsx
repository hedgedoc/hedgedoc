/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { concatCssClasses } from '../../../utils/concat-css-classes'
import type { PropsWithDataTestId } from '../../../utils/test-id'
import { testId } from '../../../utils/test-id'
import { UiIcon } from '../icons/ui-icon'
import styles from './icon-button.module.scss'
import React, { useMemo } from 'react'
import type { ButtonProps } from 'react-bootstrap'
import { Button } from 'react-bootstrap'
import type { Icon } from 'react-bootstrap-icons'

export interface IconButtonProps extends ButtonProps, PropsWithDataTestId {
  icon: Icon
  border?: boolean
  iconSize?: number | string
}

/**
 * A generic {@link Button button} with an icon in it.
 *
 * @param icon Which icon should be used
 * @param children The children that will be added as the content of the button.
 * @param iconFixedWidth If the icon should be of fixed width.
 * @param border Should the button have a border.
 * @param className Additional class names added to the button.
 * @param iconSize Size of the icon
 * @param props Additional props for the button.
 */
export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  children,
  border = false,
  className,
  iconSize,
  ...props
}) => {
  const finalClassName = useMemo(
    () =>
      concatCssClasses(styles['btn-icon'], 'd-inline-flex align-items-stretch', className, {
        [styles['with-border']]: border
      }),
    [border, className]
  )

  return (
    <Button {...props} className={finalClassName} {...testId('icon-button')}>
      <span className={`${styles['icon-part']}`}>
        <UiIcon size={iconSize} icon={icon} className={'icon'} />
      </span>
      {children !== undefined && <span className={`${styles['text-part']}`}>{children}</span>}
    </Button>
  )
}
