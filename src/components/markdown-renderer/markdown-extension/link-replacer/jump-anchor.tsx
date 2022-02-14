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
      const intoViewElement = document.getElementById(jumpTargetId)
      const scrollElement = document.querySelector('[data-scroll-element]')
      if (!intoViewElement || !scrollElement) {
        return
      }
      //It would be much easier to use scrollIntoView here but since the code mirror also uses smooth scroll and bugs like
      // https://stackoverflow.com/a/63563437/13103995 exist, we must use scrollTo.
      scrollElement.scrollTo({ behavior: 'smooth', top: intoViewElement.offsetTop })
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
