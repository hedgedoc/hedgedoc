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
import React, { useMemo } from 'react'
import { Button, Modal } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { useMotdContextValue } from '../../motd/motd-context'

export interface MotdModalProps {
  show: boolean
  onDismiss?: () => void
}

/**
 * Shows the MotD that is provided via context.
 *
 * @param show defines if the modal should be shown
 * @param onDismiss callback that is executed if the modal is dismissed
 */
export const MotdModal: React.FC<MotdModalProps> = ({ show, onDismiss }) => {
  useTranslation()
  const contextValue = useMotdContextValue()

  const lines = useMemo(() => {
    const rawLines = contextValue?.motdText.split('\n')
    if (rawLines === undefined || rawLines.length === 0 || !show) {
      return []
    }
    return rawLines
  }, [contextValue?.motdText, show])

  return (
    <CommonModal show={lines.length > 0} titleI18nKey={'motd.title'} onHide={onDismiss} {...cypressId('motd-modal')}>
      <Modal.Body>
        <EditorToRendererCommunicatorContextProvider>
          <RendererIframe
            frameClasses={'w-100'}
            rendererType={RendererType.SIMPLE}
            markdownContentLines={lines}
            adaptFrameHeightToContent={true}
            showWaitSpinner={true}
          />
        </EditorToRendererCommunicatorContextProvider>
      </Modal.Body>
      <Modal.Footer>
        <Button variant={'success'} onClick={onDismiss} {...testId('motd-dismiss')} {...cypressId('motd-dismiss')}>
          <Trans i18nKey={'common.dismiss'} />
        </Button>
      </Modal.Footer>
    </CommonModal>
  )
}
