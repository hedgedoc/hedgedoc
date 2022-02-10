/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { Suspense, useCallback } from 'react'
import { Button, Modal } from 'react-bootstrap'
import { CommonModal } from '../modals/common-modal'
import { Trans, useTranslation } from 'react-i18next'
import { useApplicationState } from '../../../hooks/common/use-application-state'
import { dismissMotd } from '../../../redux/motd/methods'
import { cypressId } from '../../../utils/cypress-attribute'
import { WaitSpinner } from '../wait-spinner/wait-spinner'

const MotdRenderer = React.lazy(() => import('./motd-renderer'))

/**
 * Reads the motd from the global application state and shows it in a modal.
 * If the modal gets dismissed by the user then the "last modified" identifier will be written into the local storage
 * to prevent that the motd will be shown again until it gets changed.
 */
export const MotdModal: React.FC = () => {
  useTranslation()
  const motdState = useApplicationState((state) => state.motd)

  const dismiss = useCallback(() => {
    if (!motdState) {
      return
    }
    dismissMotd()
  }, [motdState])

  if (motdState === null || motdState.dismissed) {
    return null
  } else {
    return (
      <CommonModal {...cypressId('motd')} show={true} title={'motd.title'}>
        <Modal.Body>
          <Suspense fallback={<WaitSpinner />}>
            <MotdRenderer />
          </Suspense>
        </Modal.Body>
        <Modal.Footer>
          <Button variant={'success'} onClick={dismiss} {...cypressId('motd-dismiss')}>
            <Trans i18nKey={'common.dismiss'} />
          </Button>
        </Modal.Footer>
      </CommonModal>
    )
  }
}
