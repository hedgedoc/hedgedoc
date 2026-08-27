/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getAccessTokenList } from '../../../api/api-tokens'
import { useUiNotifications } from '../../notifications/ui-notification-boundary'
import { AccessTokenCreationForm } from './access-token-creation-form/access-token-creation-form'
import { AccessTokenListEntry } from './access-token-list-entry'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { ListGroup } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import type { ApiTokenInterface } from '@hedgedoc/commons'

export interface AccessTokenUpdateProps {
  onUpdateList: () => void
}

/**
 * Shows the user's API tokens and allows creating or deleting them.
 */
export const ProfileAccessTokens: React.FC = () => {
  useTranslation()
  const [accessTokens, setAccessTokens] = useState<ApiTokenInterface[]>([])
  const { showErrorNotificationBuilder } = useUiNotifications()

  const refreshAccessTokens = useCallback(() => {
    getAccessTokenList()
      .then((tokens) => {
        setAccessTokens(tokens)
      })
      .catch(showErrorNotificationBuilder('profile.accessTokens.loadingFailed'))
  }, [showErrorNotificationBuilder])

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
    <div className='py-3 access-tokens'>
      <h5>
        <Trans i18nKey='profile.accessTokens.title' />
      </h5>
      <p className='text-start'>
        <Trans i18nKey='profile.accessTokens.info' />
      </p>
      <p className='text-start small'>
        <Trans i18nKey='profile.accessTokens.infoDev' />
      </p>
      <hr />
      {accessTokens.length === 0 && <Trans i18nKey='profile.accessTokens.noTokens' />}
      <ListGroup>{tokensDom}</ListGroup>
      <hr />
      {accessTokens.length < 200 && <AccessTokenCreationForm onUpdateList={refreshAccessTokens} />}
    </div>
  )
}
