/*
SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: AGPL-3.0-only
*/

import React from 'react'
import { Navbar } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useIsDarkModeActivated } from '../../../hooks/common/use-is-dark-mode-activated'
import { Branding } from '../../common/branding/branding'
import {
  HedgeDocLogoSize,
  HedgeDocLogoType,
  HedgeDocLogoWithText
} from '../../common/hedge-doc-logo/hedge-doc-logo-with-text'

export const NavbarBranding: React.FC = () => {
  const darkModeActivated = useIsDarkModeActivated()

  return (
    <Navbar.Brand>
      <Link to="/intro" className="text-secondary text-decoration-none d-flex align-items-center">
        <HedgeDocLogoWithText
          logoType={darkModeActivated ? HedgeDocLogoType.WB_HORIZONTAL : HedgeDocLogoType.BW_HORIZONTAL}
          size={HedgeDocLogoSize.SMALL}/>
        <Branding inline={true}/>
      </Link>
    </Navbar.Brand>
  )
}
