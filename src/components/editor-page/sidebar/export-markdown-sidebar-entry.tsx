/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { useNoteMarkdownContent } from '../../../hooks/common/use-note-markdown-content'
import { download } from '../../common/download/download'
import { SidebarButton } from './sidebar-button'

export const ExportMarkdownSidebarEntry: React.FC = () => {
  useTranslation()

  const markdownContent = useNoteMarkdownContent()
  const onClick = useCallback(() => {
    download(markdownContent, `title.md`, 'text/markdown') //todo: replace hard coded title with redux
  }, [markdownContent])

  return (
    <SidebarButton data-cy={ 'menu-export-markdown' } onClick={ onClick } icon={ 'file-text' }>
      <Trans i18nKey={ 'editor.export.markdown-file' }/>
    </SidebarButton>
  )
}
