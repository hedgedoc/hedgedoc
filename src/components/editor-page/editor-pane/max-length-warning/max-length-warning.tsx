/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { MaxLengthWarningModal } from './max-length-warning-modal'
import { useNoteMarkdownContent } from '../../../../hooks/common/use-note-markdown-content'
import { useApplicationState } from '../../../../hooks/common/use-application-state'

/**
 * Watches the length of the document and shows a warning modal to the user if the document length exceeds the configured value.
 */
export const MaxLengthWarning: React.FC = () => {
  const [showMaxLengthWarningModal, setShowMaxLengthWarningModal] = useState(false)
  const maxLengthWarningAlreadyShown = useRef(false)
  const maxDocumentLength = useApplicationState((state) => state.config.maxDocumentLength)
  const hideWarning = useCallback(() => setShowMaxLengthWarningModal(false), [])
  const markdownContent = useNoteMarkdownContent()

  useEffect(() => {
    if (markdownContent.length > maxDocumentLength && !maxLengthWarningAlreadyShown.current) {
      setShowMaxLengthWarningModal(true)
      maxLengthWarningAlreadyShown.current = true
    }
    if (markdownContent.length <= maxDocumentLength) {
      maxLengthWarningAlreadyShown.current = false
    }
  }, [markdownContent, maxDocumentLength])

  return <MaxLengthWarningModal show={showMaxLengthWarningModal} onHide={hideWarning} />
}
