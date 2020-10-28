import React, { Fragment, useCallback, useRef } from 'react'
import { Dropdown } from 'react-bootstrap'
import { Trans } from 'react-i18next'
import { useSelector } from 'react-redux'
import { ApplicationState } from '../../../../redux'
import { setDocumentContent } from '../../../../redux/document-content/methods'
import { ForkAwesomeIcon } from '../../../common/fork-awesome/fork-awesome-icon'

export const ImportFile: React.FC = () => {
  const markdownContent = useSelector((state: ApplicationState) => state.documentContent.content)

  const fileInputReference = useRef<HTMLInputElement>(null)
  const doImport = useCallback(() => {
    const fileInput = fileInputReference.current
    if (!fileInput) {
      return
    }
    fileInput.addEventListener('change', () => {
      if (!fileInput.files || fileInput.files.length < 1) {
        return
      }
      const file = fileInput.files[0]
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
        fileInput.value = ''
      })
      fileReader.readAsText(file)
    })
    fileInput.click()
  }, [markdownContent])

  return (
    <Fragment>
      <input type='file' ref={fileInputReference} className='d-none' accept='.md, text/markdown, text/plain'/>
      <Dropdown.Item className='small import-md-file' onClick={doImport}>
        <ForkAwesomeIcon icon='file-text-o' className={'mx-2'}/>
        <Trans i18nKey='editor.import.file'/>
      </Dropdown.Item>
    </Fragment>
  )
}
