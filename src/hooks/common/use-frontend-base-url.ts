/*
SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: AGPL-3.0-only
*/

import { useLocation } from 'react-router'

export const useFrontendBaseUrl = (): string => {
  const { pathname } = useLocation()

  return window.location.pathname.replace(pathname, '')
}
