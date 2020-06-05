import React, { useRef, useState } from 'react'
import { Button } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { ForkAwesomeIcon } from '../../../../../fork-awesome/fork-awesome-icon'
import { convertV1History, V1HistoryEntry } from '../../../../../utils/historyUtils'
import { ErrorModal } from '../../../../error-modal/error-modal'
import { HistoryEntry, HistoryJson } from '../history'

export interface ImportHistoryButtonProps {
  onImportHistory: (entries: HistoryEntry[]) => void
}

export const ImportHistoryButton: React.FC<ImportHistoryButtonProps> = ({ onImportHistory }) => {
  const { t } = useTranslation()
  const uploadInput = useRef<HTMLInputElement>(null)
  const [show, setShow] = useState(false)
  const [fileName, setFilename] = useState('')
  const [i18nKey, setI18nKey] = useState('')

  const handleShow = (key: string) => {
    setI18nKey(key)
    setShow(true)
  }

  const handleClose = () => {
    setI18nKey('')
    setShow(false)
  }

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { validity, files } = event.target
    if (files && files[0] && validity.valid) {
      const file = files[0]
      setFilename(file.name)
      if (file.type !== 'application/json' && file.type !== '') {
        handleShow('landing.history.modal.importHistoryError.textWithFile')
        return
      }
      const fileReader = new FileReader()
      fileReader.onload = (event) => {
        if (event.target && event.target.result) {
          try {
            const result = event.target.result as string
            const data = JSON.parse(result) as HistoryJson
            if (data) {
              if (data.version) {
                if (data.version === 2) {
                  onImportHistory(data.entries)
                } else {
                  // probably a newer version we can't support
                  handleShow('landing.history.modal.importHistoryError.tooNewVersion')
                }
              } else {
                const oldEntries = JSON.parse(result) as V1HistoryEntry[]
                onImportHistory(convertV1History(oldEntries))
              }
            }
          } catch {
            handleShow('landing.history.modal.importHistoryError.textWithFile')
          }
        }
      }
      fileReader.readAsText(file)
    } else {
      handleShow('landing.history.modal.importHistoryError.textWithOutFile')
    }
  }

  return (
    <div>
      <input type='file' className="d-none" accept=".json" onChange={handleUpload} ref={uploadInput}/>
      <Button variant={'light'}
        title={t('landing.history.toolbar.import')}
        onClick={() => uploadInput.current?.click()}
      >
        <ForkAwesomeIcon icon='upload'/>
      </Button>
      <ErrorModal
        show={show}
        onHide={handleClose}
        title='landing.history.modal.importHistoryError.title'
        icon='exclamation-circle'
      >
        {fileName !== ''
          ? <h5>
            <Trans i18nKey={i18nKey} values={{ fileName: fileName }}/>
          </h5>
          : <h5><Trans i18nKey={i18nKey}/></h5>
        }
      </ErrorModal>
    </div>
  )
}
