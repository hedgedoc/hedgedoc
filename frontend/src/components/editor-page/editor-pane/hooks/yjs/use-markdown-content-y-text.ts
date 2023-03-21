/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { MARKDOWN_CONTENT_CHANNEL_NAME } from '@hedgedoc/commons'
import { useMemo } from 'react'
import type { Doc } from 'yjs'
import type { Text as YText } from 'yjs'

/**
 * Extracts the y-text channel that saves the markdown content from the given yDoc.
 *
 * @param yDoc The yjs document from which the yText should be extracted
 * @return the extracted yText channel
 */
export const useMarkdownContentYText = (yDoc: Doc | undefined): YText | undefined => {
  return useMemo(() => yDoc?.getText(MARKDOWN_CONTENT_CHANNEL_NAME), [yDoc])
}
