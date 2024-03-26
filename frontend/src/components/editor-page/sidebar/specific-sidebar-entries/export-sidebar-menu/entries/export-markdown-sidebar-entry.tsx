/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useNoteMarkdownContent } from '../../../../../../hooks/common/use-note-markdown-content'
import { getGlobalState } from '../../../../../../redux'
import { cypressId } from '../../../../../../utils/cypress-attribute'
import { download } from '../../../../../common/download/download'
import { SidebarButton } from '../../../sidebar-button/sidebar-button'
import React, { useCallback } from 'react'
import { FileText as IconFileText } from 'react-bootstrap-icons'
import { Trans } from 'react-i18next'
import { useNoteFilename } from '../../../../../../hooks/common/use-note-filename'

/**
 * Editor sidebar entry for exporting the markdown content into a local file.
 */
export const ExportMarkdownSidebarEntry: React.FC = () => {
  const markdownContent = useNoteMarkdownContent()
  const fileName = useNoteFilename()
  const onClick = useCallback(() => {
    const title = getGlobalState().noteDetails?.title
    if (title === undefined) {
      return
    }
    download(markdownContent, fileName, 'text/markdown')
  }, [markdownContent, fileName])

  return (
    <SidebarButton {...cypressId('menu-export-markdown')} onClick={onClick} icon={IconFileText}>
      <Trans i18nKey={'editor.export.markdown-file'} />
    </SidebarButton>
  )
}
