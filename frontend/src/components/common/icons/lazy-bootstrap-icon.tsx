/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { testId } from '../../../utils/test-id'
import type { BootstrapIconName } from './bootstrap-icons'
import { BootstrapLazyIcons } from './bootstrap-icons'
import React, { Suspense, useMemo } from 'react'

export interface LazyBootstrapIconProps {
  icon: BootstrapIconName
  size?: number
  className?: string
}

/**
 * Renders a bootstrap icon.
 *
 * @param iconName the internal name of the icon
 * @param size the size of the icon - the default is 1
 * @see https://icons.getbootstrap.com/
 */
export const LazyBootstrapIcon: React.FC<LazyBootstrapIconProps> = ({ icon, size, className }) => {
  const fullSize = useMemo(() => `${size ?? 1}em`, [size])
  const Icon = BootstrapLazyIcons[icon]

  return (
    <Suspense fallback={<></>}>
      <Icon
        width={fullSize}
        height={fullSize}
        fill={'currentColor'}
        className={className}
        {...testId(`lazy-bootstrap-icon-${icon}`)}></Icon>
    </Suspense>
  )
}
