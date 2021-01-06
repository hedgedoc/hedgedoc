/*
SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: AGPL-3.0-only
*/

import { DateTime } from 'luxon'

import React from 'react'

export interface TimeFromNowProps {
  time: DateTime
}

export const TimeFromNow: React.FC<TimeFromNowProps> = ({ time }) => {
  return (
    <time className={'mx-1'} title={time.toFormat('DDDD T')} dateTime={time.toString()}>{time.toRelative()}</time>
  )
}
