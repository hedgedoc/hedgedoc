/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { cypressId } from '../../../../utils/cypress-attribute'
import { FileContentFormat, readFile } from '../../../../utils/read-file'
import { ShowIf } from '../../../common/show-if/show-if'
import { useChangeEditorContentCallback } from '../../change-content-context/use-change-editor-content-callback'
import { SidebarButton } from '../sidebar-button/sidebar-button'
import { UploadInput } from '../upload-input'
import React, { Fragment, useCallback, useRef } from 'react'
import { Trans, useTranslation } from 'react-i18next'

/**
 * Renders a sidebar entry that allows to import the content of markdown files into the currently opened note.
 */
export const ImportMarkdownSidebarEntry: React.FC = () => {
  useTranslation()
  const changeEditorContent = useChangeEditorContentCallback()

  const onImportMarkdown = useCallback(
    async (file: File): Promise<void> => {
      const content = await readFile(file, FileContentFormat.TEXT)
      changeEditorContent?.(({ markdownContent }) => {
        const newContent = (markdownContent.length === 0 ? '' : '\n') + content
        return [
          [
            {
              from: markdownContent.length,
              to: markdownContent.length,
              insert: newContent
            }
          ],
          undefined
        ]
      })
    },
    [changeEditorContent]
  )

  const clickRef = useRef<() => void>()
  const buttonClick = useCallback(() => {
    clickRef.current?.()
  }, [])

  return (
    <Fragment>
      <SidebarButton
        {...cypressId('menu-import-markdown-button')}
        icon={'file-text-o'}
        onClick={buttonClick}
        disabled={!changeEditorContent}>
        <Trans i18nKey={'editor.import.file'} />
      </SidebarButton>
      <ShowIf condition={!!changeEditorContent}>
        <UploadInput
          onLoad={onImportMarkdown}
          {...cypressId('menu-import-markdown-input')}
          allowedFileTypes={'.md, text/markdown, text/plain'}
          onClickRef={clickRef}
        />
      </ShowIf>
    </Fragment>
  )
}
