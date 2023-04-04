/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useBooleanState } from '../../../../hooks/common/use-boolean-state'
import { useNoteMarkdownContent } from '../../../../hooks/common/use-note-markdown-content'
import { useFrontendConfig } from '../../../common/frontend-config-context/use-frontend-config'
import { MaxLengthWarningModal } from './max-length-warning-modal'
import React, { useEffect, useRef } from 'react'

/**
 * Watches the length of the document and shows a warning modal to the user if the document length exceeds the configured value.
 */
export const MaxLengthWarning: React.FC = () => {
  const [modalVisibility, showModal, closeModal] = useBooleanState()
  const maxLengthWarningAlreadyShown = useRef(false)
  const maxDocumentLength = useFrontendConfig().maxDocumentLength
  const markdownContent = useNoteMarkdownContent()

  useEffect(() => {
    if (markdownContent.length > maxDocumentLength && !maxLengthWarningAlreadyShown.current) {
      showModal()
      maxLengthWarningAlreadyShown.current = true
    }
    if (markdownContent.length <= maxDocumentLength) {
      maxLengthWarningAlreadyShown.current = false
    }
  }, [markdownContent, maxDocumentLength, showModal])

  return <MaxLengthWarningModal show={modalVisibility} onHide={closeModal} />
}
