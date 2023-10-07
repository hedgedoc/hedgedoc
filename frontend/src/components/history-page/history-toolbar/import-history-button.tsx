/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { HistoryEntryWithOrigin } from '../../../api/history/types'
import { HistoryEntryOrigin } from '../../../api/history/types'
import { useApplicationState } from '../../../hooks/common/use-application-state'
import { useTranslatedText } from '../../../hooks/common/use-translated-text'
import { convertV1History, importHistoryEntries, mergeHistoryEntries } from '../../../redux/history/methods'
import type { HistoryExportJson, V1HistoryEntry } from '../../../redux/history/types'
import { cypressId } from '../../../utils/cypress-attribute'
import { UiIcon } from '../../common/icons/ui-icon'
import { useUiNotifications } from '../../notifications/ui-notification-boundary'
import { useSafeRefreshHistoryStateCallback } from './hooks/use-safe-refresh-history-state'
import React, { useCallback, useRef, useState } from 'react'
import { Button } from 'react-bootstrap'
import { Upload as IconUpload } from 'react-bootstrap-icons'
import { useIsLoggedIn } from '../../../hooks/common/use-is-logged-in'

/**
 * Button that lets the user select a history JSON file and uploads imports that into the history.
 */
export const ImportHistoryButton: React.FC = () => {
  const userExists = useIsLoggedIn()
  const historyState = useApplicationState((state) => state.history)
  const uploadInput = useRef<HTMLInputElement>(null)
  const [fileName, setFilename] = useState('')
  const { showErrorNotification, dispatchUiNotification } = useUiNotifications()
  const safeRefreshHistoryState = useSafeRefreshHistoryStateCallback()

  const onImportHistory = useCallback(
    (entries: HistoryEntryWithOrigin[]): void => {
      entries.forEach((entry) => (entry.origin = userExists ? HistoryEntryOrigin.REMOTE : HistoryEntryOrigin.LOCAL))
      importHistoryEntries(mergeHistoryEntries(historyState, entries)).catch((error: Error) => {
        showErrorNotification('landing.history.error.setHistory.text')(error)
        safeRefreshHistoryState()
      })
    },
    [historyState, safeRefreshHistoryState, showErrorNotification, userExists]
  )

  const resetInputField = useCallback(() => {
    if (!uploadInput.current) {
      return
    }
    uploadInput.current.value = ''
  }, [uploadInput])

  const onUploadButtonClick = useCallback(() => uploadInput.current?.click(), [uploadInput])

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
      //TODO: [mrdrogdrog] The following whole block can be shortened using our `readFile` util.
      // But I won't do it right now because the whole components needs a make over and that's definitely out of scope for my current PR.
      // https://github.com/hedgedoc/hedgedoc/issues/5042
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

  const buttonTitle = useTranslatedText('landing.history.toolbar.import')

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
        variant={'secondary'}
        title={buttonTitle}
        onClick={onUploadButtonClick}
        {...cypressId('import-history-file-button')}>
        <UiIcon icon={IconUpload} />
      </Button>
    </div>
  )
}
