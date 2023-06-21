/*
 * SPDX-FileCopyrightText: Code: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react'
import type { IconProps } from 'react-bootstrap-icons'

/**
 * Renders the gitlab logo.
 *
 * @see https://about.gitlab.com/handbook/marketing/brand-and-product-marketing/brand/brand-activation/trademark-guidelines/ for gitlab press kit trademark guidelines.
 * @param color the icon color. Default is current text color
 * @param size the size of the icon. Default is the current text size
 * @param title custom title for the SVG
 */
export const IconGitlab = React.forwardRef<SVGSVGElement, IconProps>(
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
        <path d='m15.734 6.1-.023-.058L13.534.358a.567.567 0 0 0-.224-.27.583.583 0 0 0-.667.036.583.583 0 0 0-.193.294l-1.47 4.498H5.024L3.555.418A.572.572 0 0 0 3.36.124a.583.583 0 0 0-.666-.036.572.572 0 0 0-.224.27L.289 6.038l-.022.058a4.044 4.044 0 0 0 1.341 4.674l.008.006.02.014 3.317 2.484 1.642 1.243 1 .754a.672.672 0 0 0 .813 0l1-.754 1.64-1.243 3.338-2.499.009-.007a4.046 4.046 0 0 0 1.34-4.669z' />
      </svg>
    )
  }
)

IconGitlab.displayName = 'IconGitlab'
