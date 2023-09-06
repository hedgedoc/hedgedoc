/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useNoteMarkdownContent } from '../../../../hooks/common/use-note-markdown-content'
import { getGlobalState } from '../../../../redux'
import { cypressId } from '../../../../utils/cypress-attribute'
import { download } from '../../../common/download/download'
import { SidebarButton } from '../sidebar-button/sidebar-button'
import React, { useCallback } from 'react'
import { FileText as IconFileText } from 'react-bootstrap-icons'
import { Trans, useTranslation } from 'react-i18next'
import sanitize from 'sanitize-filename'

/**
 * Editor sidebar entry for exporting the markdown content into a local file.
 */
export const ExportMarkdownSidebarEntry: React.FC = () => {
  const { t } = useTranslation()
  const markdownContent = useNoteMarkdownContent()
  const onClick = useCallback(() => {
    const title = getGlobalState().noteDetails?.title
    if (title === undefined) {
      return
    }
    const sanitized = sanitize(title)
    download(markdownContent, `${sanitized !== '' ? sanitized : t('editor.untitledNote')}.md`, 'text/markdown')
  }, [markdownContent, t])

  return (
    <SidebarButton {...cypressId('menu-export-markdown')} onClick={onClick} icon={IconFileText}>
      <Trans i18nKey={'editor.export.markdown-file'} />
    </SidebarButton>
  )
}
