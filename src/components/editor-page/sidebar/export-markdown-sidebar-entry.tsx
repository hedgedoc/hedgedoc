/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback } from 'react'
import sanitize from 'sanitize-filename'
import { store } from '../../../redux'
import { Trans, useTranslation } from 'react-i18next'
import { download } from '../../common/download/download'
import { SidebarButton } from './sidebar-button'
import { useApplicationState } from '../../../hooks/common/use-application-state'

export const ExportMarkdownSidebarEntry: React.FC = () => {
  const { t } = useTranslation()
  const documentContent = useApplicationState((state) => state.noteDetails.documentContent)
  const onClick = useCallback(() => {
    const sanitized = sanitize(store.getState().noteDetails.noteTitle)
    download(documentContent, `${sanitized !== '' ? sanitized : t('editor.untitledNote')}.md`, 'text/markdown')
  }, [documentContent, t])

  return (
    <SidebarButton data-cy={'menu-export-markdown'} onClick={onClick} icon={'file-text'}>
      <Trans i18nKey={'editor.export.markdown-file'} />
    </SidebarButton>
  )
}
