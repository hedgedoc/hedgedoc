/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ForkAwesomeIcon } from '../fork-awesome/fork-awesome-icon'
import React from 'react'
import { Button } from 'react-bootstrap'

export interface LockButtonProps {
  locked: boolean
  onLockedChanged: (newState: boolean) => void
  title: string
}

/**
 * A button with a lock icon.
 *
 * @param locked If the button should be shown as locked or not
 * @param onLockedChanged The callback to change the state from locked to unlocked and vise-versa.
 * @param title The title for the button.
 */
export const LockButton: React.FC<LockButtonProps> = ({ locked, onLockedChanged, title }) => {
  return (
    <Button variant='dark' size='sm' onClick={() => onLockedChanged(!locked)} title={title}>
      {locked ? <ForkAwesomeIcon icon='lock' /> : <ForkAwesomeIcon icon='unlock' />}
    </Button>
  )
}
