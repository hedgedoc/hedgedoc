'use client'
/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { cypressId } from '../../../utils/cypress-attribute'
import { testId } from '../../../utils/test-id'
import { CommonModal } from '../../common/modals/common-modal'
import { RendererIframe } from '../../common/renderer-iframe/renderer-iframe'
import { EditorToRendererCommunicatorContextProvider } from '../../editor-page/render-context/editor-to-renderer-communicator-context-provider'
import { RendererType } from '../../render-page/window-post-message-communicator/rendering-message'
import React, { useCallback } from 'react'
import { Button, Modal } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { useMotdMessage } from './use-motd-message'

export interface MotdModalProps {
  showExplicitly?: boolean
  onDismiss?: () => void
}

/**
 * Reads the motd from the global application state and shows it in a modal.
 * If the modal gets dismissed by the user then the "last modified" identifier will be written into the local storage
 * to prevent that the motd will be shown again until it gets changed.
 *
 * @param showExplicitly If true then the modal will be shown even if the motd was already dismissed.
 * @param onDismiss Optional callback when the modal gets dismissed.
 */
export const MotdModal: React.FC<MotdModalProps> = ({ showExplicitly, onDismiss }) => {
  useTranslation()
  const { isMessageSet, messageLines, isDismissed, dismissMotd } = useMotdMessage()

  const onClickDismiss = useCallback(() => {
    onDismiss?.()
    dismissMotd()
  }, [onDismiss, dismissMotd])

  if (process.env.NODE_ENV === 'test' && !isMessageSet) {
    return <span {...testId('loaded not visible')}></span>
  }

  return (
    <CommonModal
      show={isMessageSet && (showExplicitly || !isDismissed)}
      titleI18nKey={'motd.title'}
      {...cypressId('motd-modal')}>
      <Modal.Body>
        <EditorToRendererCommunicatorContextProvider>
          <RendererIframe
            frameClasses={'w-100'}
            rendererType={RendererType.SIMPLE}
            markdownContentLines={messageLines!}
            adaptFrameHeightToContent={true}
            showWaitSpinner={true}
          />
        </EditorToRendererCommunicatorContextProvider>
      </Modal.Body>
      <Modal.Footer>
        <Button variant={'success'} onClick={onClickDismiss} {...testId('motd-dismiss')} {...cypressId('motd-dismiss')}>
          <Trans i18nKey={'common.dismiss'} />
        </Button>
      </Modal.Footer>
    </CommonModal>
  )
}
