/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { EditorConfiguration } from 'codemirror'
import React, { ChangeEvent, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { mergeEditorPreferences } from '../../../../../redux/editor/methods'
import { EditorPreferenceInput, EditorPreferenceInputType } from './editor-preference-input'
import { EditorPreferenceProperty } from './editor-preference-property'
import { useApplicationState } from '../../../../../hooks/common/use-application-state'

export interface EditorPreferenceSelectPropertyProps {
  property: EditorPreferenceProperty
  selections: string[]
}

export const EditorPreferenceSelectProperty: React.FC<EditorPreferenceSelectPropertyProps> = ({
  property,
  selections
}) => {
  const preference = useApplicationState((state) => state.editorConfig.preferences[property]?.toString() ?? '')

  const { t } = useTranslation()

  const selectItem = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const selectedItem: string = event.target.value

      mergeEditorPreferences({
        [property]: selectedItem
      } as EditorConfiguration)
    },
    [property]
  )

  const i18nPrefix = `editor.modal.preferences.${property}`

  return (
    <EditorPreferenceInput
      onChange={selectItem}
      property={property}
      type={EditorPreferenceInputType.SELECT}
      value={preference}>
      {selections.map((selection) => (
        <option key={selection} value={selection}>
          {t(`${i18nPrefix}.${selection}`)}
        </option>
      ))}
    </EditorPreferenceInput>
  )
}
