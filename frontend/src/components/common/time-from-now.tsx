/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { DateTime } from 'luxon'
import React from 'react'

export interface TimeFromNowProps {
  time: DateTime
}

/**
 * Renders a given time relative to the current time.
 *
 * @param time The time to be rendered.
 */
export const TimeFromNow: React.FC<TimeFromNowProps> = ({ time }) => {
  return (
    <time title={time.toFormat('DDDD T')} dateTime={time.toString()}>
      {time.toRelative()}
    </time>
  )
}
