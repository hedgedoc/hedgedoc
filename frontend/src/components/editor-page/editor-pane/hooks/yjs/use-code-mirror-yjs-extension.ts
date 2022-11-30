/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { Extension } from '@codemirror/state'
import { useMemo } from 'react'
import { yCollab } from 'y-codemirror.next'
import type { Awareness } from 'y-protocols/awareness'
import type { YText } from 'yjs/dist/src/types/YText'

/**
 * Creates a {@link Extension code mirror extension} that synchronizes an editor with the given {@link YText ytext} and {@link Awareness awareness}.
 *
 * @param yText The source and target for the editor content
 * @param awareness Contains cursor positions and names from other clients that will be shown
 * @return the created extension
 */
export const useCodeMirrorYjsExtension = (yText: YText, awareness: Awareness): Extension => {
  return useMemo(() => yCollab(yText, awareness), [awareness, yText])
}
