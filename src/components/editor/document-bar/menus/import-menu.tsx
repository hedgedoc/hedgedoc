/*
SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: AGPL-3.0-only
*/

import React, { useCallback } from 'react'
import { Dropdown } from 'react-bootstrap'
import { Trans } from 'react-i18next'
import { useSelector } from 'react-redux'
import { ApplicationState } from '../../../../redux'
import { setDocumentContent } from '../../../../redux/document-content/methods'
import { ForkAwesomeIcon } from '../../../common/fork-awesome/fork-awesome-icon'
import { HiddenInputMenuEntry } from '../../../common/hidden-input-menu-entry/hidden-input-menu-entry'

export const ImportMenu: React.FC = () => {
  const markdownContent = useSelector((state: ApplicationState) => state.documentContent.content)

  const onImportMarkdown = useCallback((file: File) => {
    return new Promise<void>((resolve, reject) => {
      const fileReader = new FileReader()
      fileReader.addEventListener('load', () => {
        const newContent = fileReader.result as string
        if (markdownContent.length === 0) {
          setDocumentContent(newContent)
        } else {
          setDocumentContent(markdownContent + '\n' + newContent)
        }
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

  return (
    <Dropdown className='small mx-1' alignRight={true}>
      <Dropdown.Toggle variant='light' size='sm' id='editor-menu-import' className=''>
        <Trans i18nKey='editor.documentBar.import'/>
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Item className='small'>
          <ForkAwesomeIcon icon='dropbox' className={'mx-2'}/>
          Dropbox
        </Dropdown.Item>
        <Dropdown.Item className='small'>
          <ForkAwesomeIcon icon='github' className={'mx-2'}/>
          Gist
        </Dropdown.Item>
        <Dropdown.Item className='small'>
          <ForkAwesomeIcon icon='gitlab' className={'mx-2'}/>
          Gitlab Snippet
        </Dropdown.Item>
        <Dropdown.Item className='small'>
          <ForkAwesomeIcon icon='clipboard' className={'mx-2'}/>
          <Trans i18nKey='editor.import.clipboard'/>
        </Dropdown.Item>
        <HiddenInputMenuEntry
          type={'dropdown'}
          acceptedFiles={'.md, text/markdown, text/plain'}
          i18nKey={'editor.import.file'}
          icon={'file-text-o'}
          onLoad={onImportMarkdown}
        />
      </Dropdown.Menu>
    </Dropdown>
  )
}
