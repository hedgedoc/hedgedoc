/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useDarkModeState } from '../../../hooks/dark-mode/use-dark-mode-state'
import { CustomBranding } from '../../common/custom-branding/custom-branding'
import {
  HedgeDocLogoSize,
  HedgeDocLogoType,
  HedgeDocLogoWithText
} from '../../common/hedge-doc-logo/hedge-doc-logo-with-text'
import { BrandingSeparatorDash } from './branding-separator-dash'
import Link from 'next/link'
import React from 'react'
import { Navbar } from 'react-bootstrap'

/**
 * Renders the branding for the {@link AppBar}
 */
export const NavbarBranding: React.FC = () => {
  const darkModeActivated = useDarkModeState()

  return (
    <Navbar.Brand>
      <Link href='/intro' className='text-secondary text-decoration-none d-flex align-items-center'>
        <HedgeDocLogoWithText
          logoType={darkModeActivated ? HedgeDocLogoType.WB_HORIZONTAL : HedgeDocLogoType.BW_HORIZONTAL}
          size={HedgeDocLogoSize.SMALL}
        />
        <BrandingSeparatorDash />
        <CustomBranding inline={true} />
      </Link>
    </Navbar.Brand>
  )
}
