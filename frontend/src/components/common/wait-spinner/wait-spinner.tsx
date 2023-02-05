/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { UiIcon } from '../icons/ui-icon'
import React from 'react'
import { ArrowRepeat as IconArrowRepeat } from 'react-bootstrap-icons'

/**
 * Renders a indefinitely spinning spinner.
 */
export const WaitSpinner: React.FC = () => {
  return (
    <div className={'m-3 d-flex align-items-center justify-content-center'}>
      <UiIcon icon={IconArrowRepeat} spin={true} />
    </div>
  )
}
