/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../../hooks/common/use-application-state'
import { WaitSpinner } from '../../common/wait-spinner/wait-spinner'
import React from 'react'
import { Col, Container, Modal, Row } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'

/**
 * Modal with a spinner that is only shown while reconnecting to the realtime backend
 */
export const RealtimeConnectionModal: React.FC = () => {
  const isConnected = useApplicationState((state) => state.realtimeStatus.isSynced)
  useTranslation()

  return (
    <Modal show={!isConnected}>
      <Modal.Body>
        <Container className={'text-center'}>
          <Row className={'mb-4'}>
            <Col xs={12}>
              <WaitSpinner size={5}></WaitSpinner>
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              <span>
                <Trans i18nKey={'realtime.reconnect'}></Trans>
              </span>
            </Col>
          </Row>
        </Container>
      </Modal.Body>
    </Modal>
  )
}
