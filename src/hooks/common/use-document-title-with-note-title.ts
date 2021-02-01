/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { ApplicationState } from '../../redux'
import { useDocumentTitle } from './use-document-title'

export const useDocumentTitleWithNoteTitle = (): void => {
  const { t } = useTranslation()
  const untitledNote = t('editor.untitledNote')
  const noteTitle = useSelector((state: ApplicationState) => state.noteDetails.noteTitle)

  useDocumentTitle(noteTitle === '' ? untitledNote : noteTitle)
}
