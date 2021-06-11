/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useEffect } from 'react'
import { useApplicationState } from './use-application-state'

export const useDocumentTitle = (title?: string): void => {
  const brandingName = useApplicationState((state) => state.config.branding.name)

  useEffect(() => {
    document.title = `${title ? title + ' - ' : ''}HedgeDoc ${brandingName ? ` @ ${brandingName}` : ''}`
  }, [brandingName, title])
}
