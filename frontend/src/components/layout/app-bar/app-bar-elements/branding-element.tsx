/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useDarkModeState } from '../../../../hooks/dark-mode/use-dark-mode-state'
import { CustomBranding } from '../../../common/custom-branding/custom-branding'
import { HedgeDocLogoHorizontalGrey } from '../../../common/hedge-doc-logo/hedge-doc-logo-horizontal-grey'
import { LogoSize } from '../../../common/hedge-doc-logo/logo-size'
import { BrandingSeparatorDash } from './branding-separator-dash'
import Link from 'next/link'
import React from 'react'
import { Navbar } from 'react-bootstrap'

/**
 * Renders the HedgeDoc branding and branding customizations for the app bar.
 */
export const BrandingElement: React.FC = () => {
  const darkModeActivated = useDarkModeState()

  return (
    <Navbar.Brand>
      <Link href='/' className='text-secondary text-decoration-none d-flex align-items-center'>
        <HedgeDocLogoHorizontalGrey
          size={LogoSize.SMALL}
          className={'w-auto'}
          color={darkModeActivated ? 'dark' : 'light'}
        />
        <BrandingSeparatorDash />
        <CustomBranding inline={true} />
      </Link>
    </Navbar.Brand>
  )
}
