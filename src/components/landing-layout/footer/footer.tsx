/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { PoweredByLinks } from './powered-by-links'
import { SocialLink } from './social-links'

/**
 * Renders the footer.
 */
export const Footer: React.FC = () => {
  return (
    <footer className='text-light small'>
      <PoweredByLinks />
      <SocialLink />
    </footer>
  )
}
