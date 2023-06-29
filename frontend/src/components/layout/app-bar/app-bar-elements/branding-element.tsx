/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useDarkModeState } from '../../../../hooks/dark-mode/use-dark-mode-state'
import { BrandingSeparatorDash } from '../../../common/custom-branding/branding-separator-dash'
import { CustomBranding } from '../../../common/custom-branding/custom-branding'
import { HedgeDocLogoHorizontalGrey } from '../../../common/hedge-doc-logo/hedge-doc-logo-horizontal-grey'
import { LogoSize } from '../../../common/hedge-doc-logo/logo-size'
import Link from 'next/link'
import React from 'react'

/**
 * Renders the HedgeDoc branding and branding customizations for the app bar.
 */
export const BrandingElement: React.FC = () => {
  const darkModeActivated = useDarkModeState()

  return (
    <Link
      href='/intro'
      className={'text-secondary text-decoration-none d-flex align-items-center justify-content-start gap-1'}>
      <div>
        <HedgeDocLogoHorizontalGrey color={darkModeActivated ? 'dark' : 'light'} size={LogoSize.SMALL} />
      </div>
      <BrandingSeparatorDash />
      <CustomBranding inline={true} />
    </Link>
  )
}
