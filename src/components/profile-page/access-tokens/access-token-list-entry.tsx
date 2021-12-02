/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback, useState } from 'react'
import { Col, ListGroup, Row } from 'react-bootstrap'
import { cypressId } from '../../../utils/cypress-attribute'
import { Trans, useTranslation } from 'react-i18next'
import { DateTime } from 'luxon'
import { IconButton } from '../../common/icon-button/icon-button'
import type { AccessToken } from '../../../api/tokens/types'
import { AccessTokenDeletionModal } from './access-token-deletion-modal'

export interface AccessTokenListEntryProps {
  token: AccessToken
}

/**
 * List entry that represents an access token with the possibility to delete it.
 * @param token The access token.
 */
export const AccessTokenListEntry: React.FC<AccessTokenListEntryProps> = ({ token }) => {
  useTranslation()
  const [showDeletionModal, setShowDeletionModal] = useState(false)

  const onShowDeletionModal = useCallback(() => {
    setShowDeletionModal(true)
  }, [])

  const onHideDeletionModal = useCallback(() => {
    setShowDeletionModal(false)
  }, [])

  return (
    <ListGroup.Item className='bg-dark'>
      <Row>
        <Col className='text-start' {...cypressId('access-token-label')}>
          {token.label}
        </Col>
        <Col className='text-start text-white-50'>
          <Trans
            i18nKey='profile.accessTokens.lastUsed'
            values={{
              time: DateTime.fromISO(token.lastUsed).toRelative({
                style: 'short'
              })
            }}
          />
        </Col>
        <Col xs='auto'>
          <IconButton
            icon='trash-o'
            variant='danger'
            onClick={onShowDeletionModal}
            {...cypressId('access-token-delete-button')}
          />
        </Col>
      </Row>
      <AccessTokenDeletionModal token={token} show={showDeletionModal} onHide={onHideDeletionModal} />
    </ListGroup.Item>
  )
}
