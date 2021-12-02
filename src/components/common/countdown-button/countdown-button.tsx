/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useState } from 'react'
import type { ButtonProps } from 'react-bootstrap'
import { Button } from 'react-bootstrap'
import { useInterval } from 'react-use'

export interface CountdownButtonProps extends ButtonProps {
  countdownStartSeconds: number
}

/**
 * Button that starts a countdown on render and is only clickable after the countdown has finished.
 * @param countdownStartSeconds The initial amount of seconds for the countdown.
 */
export const CountdownButton: React.FC<CountdownButtonProps> = ({ countdownStartSeconds, children, ...props }) => {
  const [secondsRemaining, setSecondsRemaining] = useState(countdownStartSeconds)

  useInterval(() => setSecondsRemaining((previous) => previous - 1), secondsRemaining <= 0 ? null : 1000)

  return (
    <Button disabled={secondsRemaining > 0} {...props}>
      {secondsRemaining > 0 ? secondsRemaining : children}
    </Button>
  )
}
