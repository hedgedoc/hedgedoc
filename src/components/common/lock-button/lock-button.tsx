/*
 SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)

 SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { Button } from 'react-bootstrap'
import { ForkAwesomeIcon } from '../fork-awesome/fork-awesome-icon'

export interface LockButtonProps {
  locked: boolean,
  onLockedChanged: (newState: boolean) => void
  title: string
}

export const LockButton: React.FC<LockButtonProps> = ({ locked, onLockedChanged, title }) => {
  return (
    <Button variant='dark' size='sm' onClick={ () => onLockedChanged(!locked) } title={ title }>
      { locked
        ? <ForkAwesomeIcon icon='lock'/>
        : <ForkAwesomeIcon icon='unlock'/>
      }
    </Button>
  )
}
