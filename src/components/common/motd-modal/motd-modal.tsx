/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { Suspense, useCallback, useMemo, useEffect, useState } from 'react'
import { Button, Modal } from 'react-bootstrap'
import { CommonModal } from '../modals/common-modal'
import { Trans, useTranslation } from 'react-i18next'
import { WaitSpinner } from '../wait-spinner/wait-spinner'
import { fetchMotd, MOTD_LOCAL_STORAGE_KEY } from './fetch-motd'
import { useAsync } from 'react-use'
import { Logger } from '../../../utils/logger'
import { testId } from '../../../utils/test-id'
import { RenderIframe } from '../../editor-page/renderer-pane/render-iframe'
import { RendererType } from '../../render-page/window-post-message-communicator/rendering-message'
import { EditorToRendererCommunicatorContextProvider } from '../../editor-page/render-context/editor-to-renderer-communicator-context-provider'
import { cypressId } from '../../../utils/cypress-attribute'

const logger = new Logger('Motd')

/**
 * Reads the motd from the global application state and shows it in a modal.
 * If the modal gets dismissed by the user then the "last modified" identifier will be written into the local storage
 * to prevent that the motd will be shown again until it gets changed.
 */
export const MotdModal: React.FC = () => {
  useTranslation()

  const { error, loading, value } = useAsync(fetchMotd)
  const [dismissed, setDismissed] = useState(false)

  const lines = useMemo(() => value?.motdText.split('\n'), [value?.motdText])

  const dismiss = useCallback(() => {
    if (value?.lastModified) {
      window.localStorage.setItem(MOTD_LOCAL_STORAGE_KEY, value.lastModified)
    }
    setDismissed(true)
  }, [value])

  useEffect(() => {
    if (error) {
      logger.error('Error while fetching motd', error)
    }
  }, [error])

  if (process.env.NODE_ENV === 'test' && !loading && !value) {
    return <span {...testId('loaded not visible')}></span>
  }

  return (
    <CommonModal show={!!lines && !loading && !error && !dismissed} title={'motd.title'} {...cypressId('motd-modal')}>
      <Modal.Body className={'bg-light'}>
        <Suspense fallback={<WaitSpinner />}>
          <EditorToRendererCommunicatorContextProvider>
            <RenderIframe
              frameClasses={'w-100'}
              rendererType={RendererType.MOTD}
              markdownContentLines={lines as string[]}
              adaptFrameHeightToContent={true}
            />
          </EditorToRendererCommunicatorContextProvider>
        </Suspense>
      </Modal.Body>
      <Modal.Footer>
        <Button variant={'success'} onClick={dismiss} {...testId('motd-dismiss')} {...cypressId('motd-dismiss')}>
          <Trans i18nKey={'common.dismiss'} />
        </Button>
      </Modal.Footer>
    </CommonModal>
  )
}
