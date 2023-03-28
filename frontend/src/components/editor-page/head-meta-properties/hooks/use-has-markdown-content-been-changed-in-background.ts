/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useIsDocumentVisible } from '../../../../hooks/common/use-is-document-visible'
import { useNoteMarkdownContent } from '../../../../hooks/common/use-note-markdown-content'
import { useEffect, useRef, useState } from 'react'

/**
 * Determines if the markdown content has been changed while the browser tab hasn't been active.
 */
export const useHasMarkdownContentBeenChangedInBackground = (): boolean => {
  const [backgroundChangesHappened, setBackgroundChangesHappened] = useState(false)
  const documentVisible = useIsDocumentVisible()
  const currentContent = useNoteMarkdownContent()
  const lastContent = useRef<string>('')

  useEffect(() => {
    if (lastContent.current === currentContent || documentVisible) {
      lastContent.current = currentContent
      setBackgroundChangesHappened(false)
      return
    }
    lastContent.current = currentContent
    setBackgroundChangesHappened(true)
  }, [currentContent, documentVisible])

  return backgroundChangesHappened
}
