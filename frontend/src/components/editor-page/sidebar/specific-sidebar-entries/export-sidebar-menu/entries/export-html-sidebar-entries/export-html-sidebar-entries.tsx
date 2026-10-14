/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { Fragment, useMemo } from 'react'
import { ExportStyledHtmlSidebarEntry } from './export-styled-html-sidebar-entry'
import { ExportUnstyledHtmlSidebarEntry } from './export-unstyled-html-sidebar-entry'
import { useEditorReceiveHandler } from '../../../../../../render-page/window-post-message-communicator/hooks/use-editor-receive-handler'
import { CommunicationMessageType } from '../../../../../../render-page/window-post-message-communicator/rendering-message'
import { download } from '../../../../../../common/download/download'
import { useNoteFilename } from '../../../../../../../hooks/common/use-note-filename'
import type { ExportButtonProps } from '../../types'

export const ExportHtmlSidebarEntries: React.FC<ExportButtonProps> = ({ selectedMenuId }) => {
  const fileName = useNoteFilename('html')

  useEditorReceiveHandler(
    CommunicationMessageType.EXPORT_HTML_RESPONSE,
    useMemo(
      () =>
        ({ html }) => {
          download(html, fileName, 'text/html')
        },
      [fileName]
    )
  )
  return (
    <Fragment>
      <ExportStyledHtmlSidebarEntry selectedMenuId={selectedMenuId} />
      <ExportUnstyledHtmlSidebarEntry selectedMenuId={selectedMenuId} />
    </Fragment>
  )
}
