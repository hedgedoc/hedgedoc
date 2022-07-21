/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { DateTime } from 'luxon'
import type { FormEvent } from 'react'
import { useCallback } from 'react'
import { postNewAccessToken } from '../../../../../api/tokens'
import { showErrorNotification } from '../../../../../redux/ui-notifications/methods'
import type { AccessTokenWithSecret } from '../../../../../api/tokens/types'

/**
 * Callback for requesting a new access token from the API and returning the response token and secret.
 *
 * @param label The label for the new access token.
 * @param expiryDate The expiry date of the new access token.
 * @param setNewTokenWithSecret Callback to set the new access token with the secret from the API.
 * @return Callback that can be called when the new access token should be requested.
 */
export const useOnCreateToken = (
  label: string,
  expiryDate: string,
  setNewTokenWithSecret: (token: AccessTokenWithSecret) => void
): ((event: FormEvent) => void) => {
  return useCallback(
    (event: FormEvent) => {
      event.preventDefault()
      const expiryInMillis = DateTime.fromFormat(expiryDate, 'yyyy-MM-dd').toMillis()
      postNewAccessToken(label, expiryInMillis)
        .then((tokenWithSecret) => {
          setNewTokenWithSecret(tokenWithSecret)
        })
        .catch(showErrorNotification('profile.accessTokens.creationFailed'))
    },
    [expiryDate, label, setNewTokenWithSecret]
  )
}
