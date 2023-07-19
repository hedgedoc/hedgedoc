/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { setNoteContent } from '../../../../../redux/note-details/methods'
import type { RealtimeDoc } from '@hedgedoc/commons'
import { useEffect } from 'react'

/**
 * One-Way-synchronizes the text of the markdown content channel from the given {@link RealtimeDoc realtime doc} into the global application state.
 *
 * @param realtimeDoc The {@link RealtimeDoc realtime doc} that contains the markdown content
 */
export const useBindYTextToRedux = (realtimeDoc: RealtimeDoc): void => {
  useEffect(() => {
    const yText = realtimeDoc.getMarkdownContentChannel()
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    const yTextCallback = () => setNoteContent(yText.toString())
    yText.observe(yTextCallback)
    return () => yText.unobserve(yTextCallback)
  }, [realtimeDoc])
}
