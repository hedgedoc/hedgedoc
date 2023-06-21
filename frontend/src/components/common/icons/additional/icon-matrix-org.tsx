/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react'
import type { IconProps } from 'react-bootstrap-icons'

/**
 * Renders the matrix.org logo.
 *
 * @see https://matrix.org
 * @param color the icon color. Default is current text color
 * @param size the size of the icon. Default is the current text size
 * @param title custom title for the SVG
 */
export const IconMatrixOrg = React.forwardRef<SVGSVGElement, IconProps>(
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
        <path d='M1.035 0v15.998h1.52v-.366H1.46V.384L2.55.366V0Zm12.41.002v.366h1.096v15.248l-1.096.018V16h1.52V.002ZM6.868 5.06c-.37 0-.704.08-.994.242-.299.17-.553.404-.745.686h-.023v-.77l-1.483.009v5.698h1.564V7.616c0-.28.04-.506.121-.68A1.1 1.1 0 0 1 5.6 6.54a.974.974 0 0 1 .353-.186c.095-.03.193-.047.292-.051.252 0 .441.043.57.127.125.08.22.198.274.337.057.146.089.3.094.458.007.163.01.33.01.5v3.198H8.76V7.748c0-.176.013-.35.04-.524.021-.163.073-.32.153-.464a.923.923 0 0 1 .32-.331c.137-.084.314-.127.534-.127.222 0 .397.037.525.11a.734.734 0 0 1 .292.298c.07.138.11.288.121.441.015.169.022.349.022.54v3.23h1.565V7.107a2.6 2.6 0 0 0-.154-.946 1.616 1.616 0 0 0-.429-.634 1.681 1.681 0 0 0-.66-.354 3.027 3.027 0 0 0-.835-.11c-.395 0-.74.095-1.03.287-.292.19-.521.41-.69.66-.155-.354-.382-.6-.68-.74a2.275 2.275 0 0 0-.985-.21Z' />
      </svg>
    )
  }
)

IconMatrixOrg.displayName = 'IconHedgeDoc'
