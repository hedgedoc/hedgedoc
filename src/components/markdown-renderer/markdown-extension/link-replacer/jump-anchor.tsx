/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { AllHTMLAttributes } from 'react'
import React, { useCallback } from 'react'

export interface JumpAnchorProps extends AllHTMLAttributes<HTMLAnchorElement> {
  jumpTargetId: string
}

export const JumpAnchor: React.FC<JumpAnchorProps> = ({ jumpTargetId, children, ...props }) => {
  const jumpToTargetId = useCallback(
    (event: React.MouseEvent<HTMLElement, MouseEvent>): void => {
      document.getElementById(jumpTargetId)?.scrollIntoView({ behavior: 'smooth' })
      event.preventDefault()
    },
    [jumpTargetId]
  )

  return (
    <a {...props} onClick={jumpToTargetId}>
      {children}
    </a>
  )
}
