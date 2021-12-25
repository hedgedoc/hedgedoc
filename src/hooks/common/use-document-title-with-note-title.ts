/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useTranslation } from 'react-i18next'
import { useApplicationState } from './use-application-state'
import { useDocumentTitle } from './use-document-title'
import { useMemo } from 'react'

export const useDocumentTitleWithNoteTitle = (): void => {
  const { t } = useTranslation()
  const untitledNote = useMemo(() => t('editor.untitledNote'), [t])
  const noteTitle = useApplicationState((state) => state.noteDetails.noteTitle)

  useDocumentTitle(noteTitle === '' ? untitledNote : noteTitle)
}
