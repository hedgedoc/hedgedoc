/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMemo } from 'react'
import { useApplicationState } from '../../../hooks/common/use-application-state'

export const useTrimmedContent = (content: string): [trimmedContent: string, contentExceedsLimit: boolean] => {
  const maxLength = useApplicationState((state) => state.config.maxDocumentLength)
  const contentExceedsLimit = content.length > maxLength

  const trimmedContent = useMemo(
    () => (contentExceedsLimit ? content.substr(0, maxLength) : content),
    [content, contentExceedsLimit, maxLength]
  )
  return [trimmedContent, contentExceedsLimit]
}
