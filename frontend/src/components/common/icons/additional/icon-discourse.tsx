/*
 * SPDX-FileCopyrightText: Code: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react'
import type { IconProps } from 'react-bootstrap-icons'

/**
 * Renders the discourse logo.
 *
 * @see https://github.com/discourse/discourse/blob/main/LICENSE.txt for discourse license.
 * @param color the icon color. Default is current text color
 * @param size the size of the icon. Default is the current text size
 * @param title custom title for the SVG
 */
export const IconDiscourse = React.forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = '1em', title, ...props }, ref) => {
    return (
      <svg
        ref={ref}
        xmlns='http://www.w3.org/2000/svg'
        width={size}
        height={size}
        fill={color}
        viewBox='0 0 16 16'
        {...props}>
        {title ? <title>{title}</title> : null}
        <path d='M7.994 0C3.654 0 0 3.52 0 7.86V16l7.993-.008c4.34 0 7.86-3.654 7.86-7.994S12.33 0 7.994 0Zm.022 3.03a4.867 4.867 0 0 1 3.833 1.8l.01.01v.002l.018.023.068.085a4.844 4.844 0 0 1 .119.163l.02.03a4.87 4.87 0 0 1-5.644 7.36l-.047-.018a4.875 4.875 0 0 1-.316-.128l-3.166.717.013-.004-.013.003.001-.004v.003l.88-2.835-.019-.04a4.93 4.93 0 0 1-.13-.261A4.87 4.87 0 0 1 8.016 3.03Z' />
      </svg>
    )
  }
)

IconDiscourse.displayName = 'IconDiscourse'
