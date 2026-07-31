/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { AllHTMLAttributes } from 'react'
import React, { useCallback } from 'react'
import { useRendererToEditorCommunicator } from '../../../editor-page/render-context/renderer-to-editor-communicator-context-provider'
import { CommunicationMessageType } from '../../../render-page/window-post-message-communicator/rendering-message'

export interface JumpAnchorProps extends AllHTMLAttributes<HTMLAnchorElement> {
  jumpTargetId: string
}

/**
 * Renders jump anchors.
 *
 * @param jumpTargetId The target id
 * @param children Children rendered into the link.
 * @param props Additional props directly given to the link
 */
export const JumpAnchor: React.FC<JumpAnchorProps> = ({ jumpTargetId, children, ...props }) => {
  const iframeCommunicator = useRendererToEditorCommunicator()
  const jumpToTargetId = useCallback(
    (event: React.MouseEvent<HTMLElement, MouseEvent>): void => {
      iframeCommunicator.sendMessageToOtherSide({
        type: CommunicationMessageType.SET_URL_HASH,
        hash: jumpTargetId
      })
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
    [iframeCommunicator, jumpTargetId]
  )

  return (
    <a {...props} onClick={jumpToTargetId} href={props.href ?? `#${jumpTargetId}`}>
      {children}
    </a>
  )
}
