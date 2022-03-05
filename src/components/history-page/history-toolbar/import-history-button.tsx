/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback, useRef, useState } from 'react'
import { Button } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { ForkAwesomeIcon } from '../../common/fork-awesome/fork-awesome-icon'
import type { HistoryEntry, HistoryExportJson, V1HistoryEntry } from '../../../redux/history/types'
import { HistoryEntryOrigin } from '../../../redux/history/types'
import {
  convertV1History,
  importHistoryEntries,
  mergeHistoryEntries,
  safeRefreshHistoryState
} from '../../../redux/history/methods'
import { dispatchUiNotification, showErrorNotification } from '../../../redux/ui-notifications/methods'
import { useApplicationState } from '../../../hooks/common/use-application-state'
import { cypressId } from '../../../utils/cypress-attribute'

export const ImportHistoryButton: React.FC = () => {
  const { t } = useTranslation()
  const userExists = useApplicationState((state) => !!state.user)
  const historyState = useApplicationState((state) => state.history)
  const uploadInput = useRef<HTMLInputElement>(null)
  const [fileName, setFilename] = useState('')

  const onImportHistory = useCallback(
    (entries: HistoryEntry[]): void => {
      entries.forEach((entry) => (entry.origin = userExists ? HistoryEntryOrigin.REMOTE : HistoryEntryOrigin.LOCAL))
      importHistoryEntries(mergeHistoryEntries(historyState, entries)).catch((error: Error) => {
        showErrorNotification('landing.history.error.setHistory.text')(error)
        safeRefreshHistoryState()
      })
    },
    [historyState, userExists]
  )

  const resetInputField = useCallback(() => {
    if (!uploadInput.current) {
      return
    }
    uploadInput.current.value = ''
  }, [uploadInput])

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const { validity, files } = event.target
    if (files && files[0] && validity.valid) {
      const file = files[0]
      setFilename(file.name)
      if (file.type !== 'application/json' && file.type !== '') {
        void dispatchUiNotification('common.errorOccurred', 'landing.history.modal.importHistoryError.textWithFile', {
          contentI18nOptions: {
            fileName
          }
        })
        resetInputField()
        return
      }
      const fileReader = new FileReader()
      fileReader.onload = (event) => {
        if (event.target && event.target.result) {
          try {
            const result = event.target.result as string
            const data = JSON.parse(result) as HistoryExportJson
            if (data) {
              if (data.version) {
                if (data.version === 2) {
                  onImportHistory(data.entries)
                } else {
                  // probably a newer version we can't support
                  void dispatchUiNotification(
                    'common.errorOccurred',
                    'landing.history.modal.importHistoryError.tooNewVersion',
                    {
                      contentI18nOptions: {
                        fileName
                      }
                    }
                  )
                }
              } else {
                const oldEntries = JSON.parse(result) as V1HistoryEntry[]
                onImportHistory(convertV1History(oldEntries))
              }
            }
            resetInputField()
          } catch {
            void dispatchUiNotification(
              'common.errorOccurred',
              'landing.history.modal.importHistoryError.textWithFile',
              {
                contentI18nOptions: {
                  fileName
                }
              }
            )
          }
        }
      }
      fileReader.readAsText(file)
    } else {
      void dispatchUiNotification(
        'common.errorOccurred',
        'landing.history.modal.importHistoryError.textWithOutFile',
        {}
      )
      resetInputField()
    }
  }

  return (
    <div>
      <input
        type='file'
        className='d-none'
        accept='.json'
        onChange={handleUpload}
        ref={uploadInput}
        {...cypressId('import-history-file-input')}
      />
      <Button
        variant={'light'}
        title={t('landing.history.toolbar.import')}
        onClick={() => uploadInput.current?.click()}
        {...cypressId('import-history-file-button')}>
        <ForkAwesomeIcon icon='upload' />
      </Button>
    </div>
  )
}
