/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { postNewAccessToken } from '../../../../../api/api-tokens'
import { useUiNotifications } from '../../../../notifications/ui-notification-boundary'
import { DateTime } from 'luxon'
import type { FormEvent } from 'react'
import { useCallback } from 'react'
import type { ApiTokenWithSecretDto } from '@hedgedoc/commons'

/**
 * Callback for requesting a new access token from the API and returning the response token and secret.
 *
 * @param label The label for the new access token.
 * @param expiryDateStr The expiry date of the new access token.
 * @param setNewTokenWithSecret Callback to set the new access token with the secret from the API.
 * @return Callback that can be called when the new access token should be requested.
 */
export const useOnCreateToken = (
  label: string,
  expiryDateStr: string,
  setNewTokenWithSecret: (token: ApiTokenWithSecretDto) => void
): ((event: FormEvent) => void) => {
  const { showErrorNotification } = useUiNotifications()

  return useCallback(
    (event: FormEvent) => {
      event.preventDefault()
      const expiryDate = DateTime.fromFormat(expiryDateStr, 'yyyy-MM-dd').toJSDate()
      postNewAccessToken(label, expiryDate)
        .then((tokenWithSecret) => {
          setNewTokenWithSecret(tokenWithSecret)
        })
        .catch(showErrorNotification('profile.accessTokens.creationFailed'))
    },
    [expiryDateStr, label, setNewTokenWithSecret, showErrorNotification]
  )
}
