/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { Extension } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { useMemo, useState } from 'react'

/**
 * Provides an extension that checks when the code mirror, that loads the extension, has its first update.
 *
 * @return The extension that listens for editor updates and a boolean that defines if the first update already happened
 */
export const useOnFirstEditorUpdateExtension = (): [Extension, boolean] => {
  const [firstUpdateHappened, setFirstUpdateHappened] = useState<boolean>(false)
  const extension = useMemo(() => EditorView.updateListener.of(() => setFirstUpdateHappened(true)), [])
  return [extension, firstUpdateHappened]
}
