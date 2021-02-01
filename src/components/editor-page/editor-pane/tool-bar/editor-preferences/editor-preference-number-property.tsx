/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { EditorConfiguration } from 'codemirror'
import equal from "fast-deep-equal"
import React, { ChangeEvent, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { ApplicationState } from '../../../../../redux'
import { mergeEditorPreferences } from '../../../../../redux/editor/methods'
import { EditorPreferenceInput, EditorPreferenceInputType } from './editor-preference-input'
import { EditorPreferenceProperty } from './editor-preference-property'

export interface EditorPreferenceNumberProps {
  property: EditorPreferenceProperty
}

export const EditorPreferenceNumberProperty: React.FC<EditorPreferenceNumberProps> = ({ property }) => {
  const preference = useSelector((state: ApplicationState) => state.editorConfig.preferences[property]?.toString() || '', equal)

  const selectItem = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    const selectedItem: number = Number.parseInt(event.target.value)

    mergeEditorPreferences({
      [property]: selectedItem
    } as EditorConfiguration)
  }, [property])

  return (
    <EditorPreferenceInput onChange={selectItem} property={property} type={EditorPreferenceInputType.NUMBER} value={preference}/>
  )
}
