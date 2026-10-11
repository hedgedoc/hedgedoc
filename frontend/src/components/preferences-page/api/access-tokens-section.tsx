/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getAccessTokenList } from '../../../api/api-tokens'
import { useUiNotifications } from '../../notifications/ui-notification-boundary'
import { AccessTokenCreationForm } from './access-token-creation-form/access-token-creation-form'
import { AccessTokenListEntry } from './access-token-list-entry'
import React, { useCallback, useEffect, useMemo, useState, Fragment } from 'react'
import { ListGroup } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import type { ApiTokenInterface } from '@hedgedoc/commons'

export interface AccessTokenUpdateProps {
  onUpdateList: () => void
}

const ACCESS_TOKEN_LIMIT = 200

/**
 * Preferences section that shows the user's access tokens and allows to manage them.
 */
export const AccessTokensSection: React.FC = () => {
  useTranslation()
  const [accessTokens, setAccessTokens] = useState<ApiTokenInterface[]>([])
  const { showErrorNotificationBuilder } = useUiNotifications()

  const refreshAccessTokens = useCallback(() => {
    getAccessTokenList()
      .then((tokens) => {
        setAccessTokens(tokens)
      })
      .catch(showErrorNotificationBuilder('preferences.api.accessTokens.loadingFailed'))
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
    <Fragment>
      <h3 className={'mt-4 mb-2 h5'}>
        <Trans i18nKey='preferences.api.accessTokens.active' />
      </h3>
      {accessTokens.length === 0 && <Trans i18nKey='preferences.api.accessTokens.noTokens' />}
      <ListGroup>{tokensDom}</ListGroup>
      <h3 className={'mt-4 mb-2 h5'}>
        <Trans i18nKey='preferences.api.accessTokens.create' />
      </h3>
      {accessTokens.length < ACCESS_TOKEN_LIMIT ? (
        <AccessTokenCreationForm onUpdateList={refreshAccessTokens} />
      ) : (
        <p>
          <Trans i18nKey='preferences.api.accessTokens.createdTooMany' />
        </p>
      )}
    </Fragment>
  )
}
