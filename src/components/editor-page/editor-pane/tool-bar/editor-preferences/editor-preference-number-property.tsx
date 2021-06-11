/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { EditorConfiguration } from 'codemirror'
import React, { ChangeEvent, useCallback } from 'react'
import { mergeEditorPreferences } from '../../../../../redux/editor/methods'
import { EditorPreferenceInput, EditorPreferenceInputType } from './editor-preference-input'
import { EditorPreferenceProperty } from './editor-preference-property'
import { useApplicationState } from '../../../../../hooks/common/use-application-state'

export interface EditorPreferenceNumberProps {
  property: EditorPreferenceProperty
}

export const EditorPreferenceNumberProperty: React.FC<EditorPreferenceNumberProps> = ({ property }) => {
  const preference = useApplicationState((state) => state.editorConfig.preferences[property]?.toString() ?? '')

  const selectItem = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const selectedItem: number = Number.parseInt(event.target.value)

      mergeEditorPreferences({
        [property]: selectedItem
      } as EditorConfiguration)
    },
    [property]
  )

  return (
    <EditorPreferenceInput
      onChange={selectItem}
      property={property}
      type={EditorPreferenceInputType.NUMBER}
      value={preference}
    />
  )
}
