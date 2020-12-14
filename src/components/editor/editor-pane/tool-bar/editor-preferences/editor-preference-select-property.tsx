/*
SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: AGPL-3.0-only
*/

import { EditorConfiguration } from 'codemirror'
import equal from "fast-deep-equal"
import React, { ChangeEvent, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { ApplicationState } from '../../../../../redux'
import { mergeEditorPreferences } from '../../../../../redux/editor/methods'
import { EditorPreferenceInput, EditorPreferenceInputType } from './editor-preference-input'
import { EditorPreferenceProperty } from './editor-preference-property'

export interface EditorPreferenceSelectPropertyProps {
  property: EditorPreferenceProperty
  selections: string[]
}

export const EditorPreferenceSelectProperty: React.FC<EditorPreferenceSelectPropertyProps> = ({ property, selections }) => {
  const preference = useSelector((state: ApplicationState) => state.editorConfig.preferences[property]?.toString() || '', equal)

  const { t } = useTranslation()

  const selectItem = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    const selectedItem: string = event.target.value

    mergeEditorPreferences({
      [property]: selectedItem
    } as EditorConfiguration)
  }, [property])

  const i18nPrefix = `editor.modal.preferences.${property}`

  return (
    <EditorPreferenceInput onChange={selectItem} property={property} type={EditorPreferenceInputType.SELECT} value={preference}>
      {selections.map(selection =>
        <option key={selection} value={selection}>
          {t(`${i18nPrefix}.${selection}`) }
        </option>)}
    </EditorPreferenceInput>
  )
}
