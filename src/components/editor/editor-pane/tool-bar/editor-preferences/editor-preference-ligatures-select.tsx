/*
 * SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ChangeEvent, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { ApplicationState } from '../../../../../redux'
import { setEditorLigatures } from '../../../../../redux/editor/methods'
import { EditorPreferenceInput, EditorPreferenceInputType } from './editor-preference-input'

export const EditorPreferenceLigaturesSelect: React.FC = () => {
  const ligaturesEnabled = useSelector((state: ApplicationState) => Boolean(state.editorConfig.ligatures).toString())
  const saveLigatures = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    const ligaturesActivated: boolean = event.target.value === 'true'
    setEditorLigatures(ligaturesActivated)
  }, [])
  const { t } = useTranslation()

  return (
    <EditorPreferenceInput onChange={saveLigatures} value={ligaturesEnabled} property={"ligatures"}
                           type={EditorPreferenceInputType.BOOLEAN}>
      <option value='true'>{t(`common.yes`)}</option>
      <option value='false'>{t(`common.no`)}</option>
    </EditorPreferenceInput>
  )
}
