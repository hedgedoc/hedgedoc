/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { Fragment, useCallback, useRef } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { useNoteMarkdownContent } from '../../../hooks/common/use-note-markdown-content'
import { setNoteMarkdownContent } from '../../../redux/note-details/methods'
import { SidebarButton } from './sidebar-button'
import { UploadInput } from './upload-input'

export const ImportMarkdownSidebarEntry: React.FC = () => {
  const markdownContent = useNoteMarkdownContent()
  useTranslation()

  const onImportMarkdown = useCallback((file: File) => {
    return new Promise<void>((resolve, reject) => {
      const fileReader = new FileReader()
      fileReader.addEventListener('load', () => {
        const newContent = fileReader.result as string
        setNoteMarkdownContent(markdownContent.length === 0 ? newContent : `${ markdownContent }\n${ newContent }`)
      })
      fileReader.addEventListener('loadend', () => {
        resolve()
      })
      fileReader.addEventListener('error', (error) => {
        reject(error)
      })
      fileReader.readAsText(file)
    })
  }, [markdownContent])

  const clickRef = useRef<(() => void)>()
  const buttonClick = useCallback(() => {
    clickRef.current?.()
  }, [])

  return (
    <Fragment>
      <SidebarButton data-cy={ 'menu-import-markdown' } icon={ 'file-text-o' } onClick={ buttonClick }>
        <Trans i18nKey={ 'editor.import.file' }/>
      </SidebarButton>
      <UploadInput onLoad={ onImportMarkdown } data-cy={ 'menu-import-markdown-input' }
                   acceptedFiles={ '.md, text/markdown, text/plain' } onClickRef={ clickRef }/>
    </Fragment>
  )
}
