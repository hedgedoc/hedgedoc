/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { PoweredByLinks } from './powered-by-links'
import { SocialLink } from './social-links'
import React from 'react'

/**
 * Renders the footer.
 */
export const Footer: React.FC = () => {
  return (
    <footer className='small'>
      <PoweredByLinks />
      <SocialLink />
    </footer>
  )
}
