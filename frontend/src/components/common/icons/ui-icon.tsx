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
  title?: string
}

/**
 * Renders an icon from react-bootstrap-icons.
 * @param icon The icon to render
 * @param nbsp True to render a non-breaking space after the icon
 * @param className Additional CSS classes to apply to the icon
 * @param size The size of the icon in em or as a valid width/height CSS value
 * @param spin True to spin the icon
 * @param title The title of the icon
 */
export const UiIcon: React.FC<UiIconProps> = ({ icon, nbsp, className, size, spin, title }) => {
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
          height: finalSize,
          title
        })}
        {nbsp ? <Fragment>&nbsp;</Fragment> : null}
      </Fragment>
    )
  } else {
    return null
  }
}
