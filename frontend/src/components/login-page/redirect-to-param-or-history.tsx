/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { Redirect } from '../common/redirect'
import { useGetPostLoginRedirectUrl } from './utils/use-get-post-login-redirect-url'

/**
 * Redirects the browser to the relative URL that is provided via "redirectBackTo" URL parameter.
 * If no parameter has been provided or if the URL is not relative, then "/history" will be used.
 */
export const RedirectToParamOrHistory: React.FC = () => {
  const redirectUrl = useGetPostLoginRedirectUrl()
  return <Redirect to={redirectUrl} replace={true} />
}
