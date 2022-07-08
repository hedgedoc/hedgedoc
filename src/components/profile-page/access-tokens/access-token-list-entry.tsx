/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback, useMemo } from 'react'
import { Col, ListGroup, Row } from 'react-bootstrap'
import { cypressId } from '../../../utils/cypress-attribute'
import { Trans, useTranslation } from 'react-i18next'
import { DateTime } from 'luxon'
import { IconButton } from '../../common/icon-button/icon-button'
import type { AccessToken } from '../../../api/tokens/types'
import { AccessTokenDeletionModal } from './access-token-deletion-modal'
import type { AccessTokenUpdateProps } from './profile-access-tokens'
import { useBooleanState } from '../../../hooks/common/use-boolean-state'

export interface AccessTokenListEntryProps {
  token: AccessToken
}

/**
 * List entry that represents an access token with the possibility to delete it.
 * @param token The access token.
 * @param onUpdateList Callback that is fired when the deletion modal is closed to update the token list.
 */
export const AccessTokenListEntry: React.FC<AccessTokenListEntryProps & AccessTokenUpdateProps> = ({
  token,
  onUpdateList
}) => {
  useTranslation()
  const [modalVisibility, showModal, closeModal] = useBooleanState()

  const onHideDeletionModal = useCallback(() => {
    closeModal()
    onUpdateList()
  }, [closeModal, onUpdateList])

  const lastUsed = useMemo(() => {
    if (!token.lastUsedAt) {
      return <Trans i18nKey={'profile.accessTokens.neverUsed'} />
    }
    return (
      <Trans
        i18nKey='profile.accessTokens.lastUsed'
        values={{
          time: DateTime.fromISO(token.lastUsedAt).toRelative({
            style: 'short'
          })
        }}
      />
    )
  }, [token.lastUsedAt])

  return (
    <ListGroup.Item className='bg-dark'>
      <Row>
        <Col className='text-start' {...cypressId('access-token-label')}>
          {token.label}
        </Col>
        <Col className='text-start text-white-50'>{lastUsed}</Col>
        <Col xs='auto'>
          <IconButton
            icon='trash-o'
            variant='danger'
            onClick={showModal}
            {...cypressId('access-token-delete-button')}
          />
        </Col>
      </Row>
      <AccessTokenDeletionModal token={token} show={modalVisibility} onHide={onHideDeletionModal} />
    </ListGroup.Item>
  )
}
