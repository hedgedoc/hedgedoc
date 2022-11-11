/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { ForkAwesomeIcon } from '../fork-awesome/fork-awesome-icon'

/**
 * Renders a indefinitely spinning spinner.
 */
export const WaitSpinner: React.FC = () => {
  return (
    <div className={'m-3 d-flex align-items-center justify-content-center'}>
      <ForkAwesomeIcon icon={'spinner'} className={'fa-spin'} />
    </div>
  )
}
