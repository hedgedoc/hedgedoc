/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ChangeEvent, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useApplicationState } from '../../../../../hooks/common/use-application-state'
import { setEditorSmartPaste } from '../../../../../redux/editor/methods'
import { EditorPreferenceInput, EditorPreferenceInputType } from './editor-preference-input'

export const EditorPreferenceSmartPasteSelect: React.FC = () => {
  const smartPasteEnabled = useApplicationState((state) => Boolean(state.editorConfig.smartPaste).toString())
  const saveSmartPaste = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    const smartPasteActivated: boolean = event.target.value === 'true'
    setEditorSmartPaste(smartPasteActivated)
  }, [])
  const { t } = useTranslation()

  return (
    <EditorPreferenceInput
      onChange={saveSmartPaste}
      value={smartPasteEnabled}
      property={'smartPaste'}
      type={EditorPreferenceInputType.BOOLEAN}>
      <option value='true'>{t(`common.yes`)}</option>
      <option value='false'>{t(`common.no`)}</option>
    </EditorPreferenceInput>
  )
}
