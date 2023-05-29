/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { concatCssClasses } from '../../../../utils/concat-css-classes'
import type { PropsWithDataCypressId } from '../../../../utils/cypress-attribute'
import { cypressId } from '../../../../utils/cypress-attribute'
import styles from './header-nav-link.module.scss'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { PropsWithChildren } from 'react'
import React, { useMemo } from 'react'
import { Nav } from 'react-bootstrap'

export interface HeaderNavLinkProps extends PropsWithDataCypressId {
  to: string
}

/**
 * Renders a link for the navigation top bar.
 *
 * @param to The target url
 * @param children The react elements inside of link for more description
 * @param props Other navigation item props
 */
export const HeaderNavLink: React.FC<PropsWithChildren<HeaderNavLinkProps>> = ({ to, children, ...props }) => {
  const pathname = usePathname()

  const className = useMemo(() => {
    return concatCssClasses(
      {
        [styles.active]: pathname === to
      },
      'nav-link',
      styles.link
    )
  }, [pathname, to])

  return (
    <Nav.Item>
      <Link href={to} passHref={true} className={className} {...cypressId(props)}>
        {children}
      </Link>
    </Nav.Item>
  )
}
