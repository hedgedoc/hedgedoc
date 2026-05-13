/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useSingleStringUrlParameter } from '../../../hooks/common/use-single-string-url-parameter'

export const DEFAULT_FALLBACK_URL = '/explore/my'

/**
 * Returns the URL that the user should be redirected to after logging in.
 * If no parameter has been provided or if the URL is not relative, then "/explore/my" will be used.
 */
export const useGetPostLoginRedirectUrl = (): string => {
  const redirectBackUrl = useSingleStringUrlParameter('redirectBackTo', DEFAULT_FALLBACK_URL)
  return redirectBackUrl.startsWith('/') && !redirectBackUrl.startsWith('//') ? redirectBackUrl : DEFAULT_FALLBACK_URL
}
