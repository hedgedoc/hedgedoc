/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { TimeFromNowProps } from '../time-from-now'
import { TimeFromNow } from '../time-from-now'
import { UnitalicBoldContent } from '../unitalic-bold-content'
import React from 'react'

export const UnitalicBoldTimeFromNow: React.FC<TimeFromNowProps> = ({ time }) => {
  return (
    <UnitalicBoldContent>
      <TimeFromNow time={time} />
    </UnitalicBoldContent>
  )
}
