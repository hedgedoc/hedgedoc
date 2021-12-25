/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useEffect, useState } from 'react'
import { Card, ListGroup } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { getAccessTokenList } from '../../../api/tokens'
import type { AccessToken } from '../../../api/tokens/types'
import { ShowIf } from '../../common/show-if/show-if'
import { AccessTokenListEntry } from './access-token-list-entry'
import { AccessTokenCreationForm } from './access-token-creation-form/access-token-creation-form'
import { showErrorNotification } from '../../../redux/ui-notifications/methods'

/**
 * Profile page section that shows the user's access tokens and allows to manage them.
 */
export const ProfileAccessTokens: React.FC = () => {
  useTranslation()
  const [accessTokens, setAccessTokens] = useState<AccessToken[]>([])

  useEffect(() => {
    getAccessTokenList()
      .then((tokens) => {
        setAccessTokens(tokens)
      })
      .catch(showErrorNotification('profile.accessTokens.loadingFailed'))
  }, [])

  return (
    <Card className='bg-dark mb-4 access-tokens'>
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
        <ListGroup>
          {accessTokens.map((token) => (
            <AccessTokenListEntry token={token} key={token.keyId} />
          ))}
        </ListGroup>
        <hr />
        <ShowIf condition={accessTokens.length < 200}>
          <AccessTokenCreationForm />
        </ShowIf>
      </Card.Body>
    </Card>
  )
}
