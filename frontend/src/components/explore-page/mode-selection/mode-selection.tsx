/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react'
import { ModeLink } from './mode-link'
import { useIsLoggedIn } from '../../../hooks/common/use-is-logged-in'
import { Mode } from './mode'

/**
 * Renders the switcher for the different modes of the explore page.
 * Since notes can't be shared with anonymous guests, the shared mode is only shown to logged-in users.
 */
export const ModeSelection: React.FC = () => {
  const userLoggedIn = useIsLoggedIn()

  return (
    <h2 className={'mb-3'}>
      <ModeLink mode={Mode.MY_NOTES} />
      {userLoggedIn && <ModeLink mode={Mode.SHARED_WITH_ME} />}
      <ModeLink mode={Mode.PUBLIC} />
    </h2>
  )
}
