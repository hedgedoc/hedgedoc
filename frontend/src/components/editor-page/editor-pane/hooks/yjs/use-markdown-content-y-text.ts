/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { RealtimeDoc } from '@hedgedoc/commons'
import { useMemo } from 'react'
import type { Text as YText } from 'yjs'

/**
 * Extracts the y-text channel that saves the markdown content from the given yDoc.
 *
 * @param yDoc The yjs document from which the yText should be extracted
 * @return the extracted yText channel
 */
export const useMarkdownContentYText = (yDoc: RealtimeDoc | undefined): YText | undefined => {
  return useMemo(() => yDoc?.getMarkdownContentChannel(), [yDoc])
}
