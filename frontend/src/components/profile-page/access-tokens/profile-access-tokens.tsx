/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getAccessTokenList } from '../../../api/tokens'
import type { AccessToken } from '../../../api/tokens/types'
import { ShowIf } from '../../common/show-if/show-if'
import { useUiNotifications } from '../../notifications/ui-notification-boundary'
import { AccessTokenCreationForm } from './access-token-creation-form/access-token-creation-form'
import { AccessTokenListEntry } from './access-token-list-entry'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Card, ListGroup } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'

export interface AccessTokenUpdateProps {
  onUpdateList: () => void
}

/**
 * Profile page section that shows the user's access tokens and allows to manage them.
 */
export const ProfileAccessTokens: React.FC = () => {
  useTranslation()
  const [accessTokens, setAccessTokens] = useState<AccessToken[]>([])
  const { showErrorNotification } = useUiNotifications()

  const refreshAccessTokens = useCallback(() => {
    getAccessTokenList()
      .then((tokens) => {
        setAccessTokens(tokens)
      })
      .catch(showErrorNotification('profile.accessTokens.loadingFailed'))
  }, [showErrorNotification])

  useEffect(() => {
    refreshAccessTokens()
  }, [refreshAccessTokens])

  const tokensDom = useMemo(
    () =>
      accessTokens.map((token) => (
        <AccessTokenListEntry token={token} key={token.keyId} onUpdateList={refreshAccessTokens} />
      )),
    [accessTokens, refreshAccessTokens]
  )

  return (
    <Card className='mb-4 access-tokens'>
      <Card.Body>
        <Card.Title>
          <Trans i18nKey='profile.accessTokens.title' />
        </Card.Title>
        <p className='text-start'>
          <Trans i18nKey='profile.accessTokens.info' />
        </p>
        <p className='text-start small'>
          <Trans i18nKey='profile.accessTokens.infoDev' />
        </p>
        <hr />
        <ShowIf condition={accessTokens.length === 0}>
          <Trans i18nKey='profile.accessTokens.noTokens' />
        </ShowIf>
        <ListGroup>{tokensDom}</ListGroup>
        <hr />
        <ShowIf condition={accessTokens.length < 200}>
          <AccessTokenCreationForm onUpdateList={refreshAccessTokens} />
        </ShowIf>
      </Card.Body>
    </Card>
  )
}
