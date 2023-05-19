/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { concatCssClasses } from '../../../utils/concat-css-classes'
import styles from './ui-icons.module.scss'
import React, { Fragment, useMemo } from 'react'
import type { Icon } from 'react-bootstrap-icons'

export interface UiIconProps {
  icon: Icon | undefined
  nbsp?: boolean
  size?: number | string
  className?: string
  spin?: boolean
}

export const UiIcon: React.FC<UiIconProps> = ({ icon, nbsp, className, size, spin }) => {
  const finalSize = useMemo(() => {
    if (size === undefined) {
      return '1em'
    } else if (typeof size === 'number') {
      return `${size}em`
    } else {
      return size
    }
  }, [size])

  const finalClassName = useMemo(() => concatCssClasses(className, { [styles.spin]: spin }), [className, spin])

  if (icon) {
    return (
      <Fragment>
        {React.createElement(icon, {
          className: finalClassName,
          width: finalSize,
          height: finalSize
        })}
        {nbsp ? <Fragment>&nbsp;</Fragment> : null}
      </Fragment>
    )
  } else {
    return null
  }
}
