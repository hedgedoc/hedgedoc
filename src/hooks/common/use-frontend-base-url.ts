/*
 SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)

 SPDX-License-Identifier: AGPL-3.0-only
 */

import { useLocation } from 'react-router'

export const useFrontendBaseUrl = (): string => {
  const { pathname } = useLocation()
  const location = window.location
  const cleanedPathName = location.pathname.replace(pathname, '')

  return `${ location.protocol }//${ location.host }${ cleanedPathName }`
}
