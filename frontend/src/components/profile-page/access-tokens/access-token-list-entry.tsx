/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useBooleanState } from '../../../hooks/common/use-boolean-state'
import { cypressId } from '../../../utils/cypress-attribute'
import { IconButton } from '../../common/icon-button/icon-button'
import { AccessTokenDeletionModal } from './access-token-deletion-modal'
import type { AccessTokenUpdateProps } from './profile-access-tokens'
import { DateTime } from 'luxon'
import React, { useCallback, useMemo } from 'react'
import { Col, ListGroup, Row } from 'react-bootstrap'
import { Trash as IconTrash } from 'react-bootstrap-icons'
import { Trans, useTranslation } from 'react-i18next'
import type { ApiTokenDto } from '@hedgedoc/commons'

export interface AccessTokenListEntryProps {
  token: ApiTokenDto
}

/**
 * List entry that represents an access token with the possibility to delete it.
 *
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
    <ListGroup.Item>
      <Row>
        <Col className='text-start' {...cypressId('access-token-label')}>
          {token.label}
        </Col>
        <Col className='text-start'>{lastUsed}</Col>
        <Col xs='auto'>
          <IconButton
            icon={IconTrash}
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
