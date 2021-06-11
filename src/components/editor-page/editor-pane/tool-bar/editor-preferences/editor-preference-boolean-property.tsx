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

export interface EditorPreferenceBooleanProps {
  property: EditorPreferenceProperty
}

export const EditorPreferenceBooleanProperty: React.FC<EditorPreferenceBooleanProps> = ({ property }) => {
  const preference = useApplicationState((state) => state.editorConfig.preferences[property]?.toString() ?? '')

  const { t } = useTranslation()
  const selectItem = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const selectedItem: boolean = event.target.value === 'true'

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
      <option value={'true'}>{t(`${i18nPrefix}.on`)}</option>
      <option value={'false'}>{t(`${i18nPrefix}.off`)}</option>
    </EditorPreferenceInput>
  )
}
