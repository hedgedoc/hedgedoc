/*
SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: AGPL-3.0-only
*/

import { EditorConfiguration } from 'codemirror'
import React, { ChangeEvent, useCallback, useState } from 'react'
import { Form } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'

export enum EditorPreferenceProperty {
  KEYMAP = 'keyMap',
  THEME = 'theme',
  INDENT_WITH_TABS = 'indentWithTabs',
  INDENT_UNIT = 'indentUnit',
  SPELL_CHECK= 'spellcheck'
}

export interface EditorPreferenceSelectProps {
  onChange: (config: EditorConfiguration) => void
  preferences: EditorConfiguration
  property: EditorPreferenceProperty
}

export const EditorPreferenceSelect: React.FC<EditorPreferenceSelectProps> = ({ property, onChange, preferences, children }) => {
  useTranslation()
  const [selected, setSelected] = useState(preferences[property])

  const selectItem = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    let selectedItem: string | boolean | number = event.target.value
    if (property === EditorPreferenceProperty.INDENT_UNIT) {
      selectedItem = parseInt(selectedItem)
    }
    setSelected(selectedItem)
    if (property === EditorPreferenceProperty.INDENT_WITH_TABS) {
      selectedItem = selectedItem === 'true'
    }
    onChange({
      ...preferences,
      [property]: selectedItem
    })
  }, [preferences, property, setSelected, onChange])

  return (
    <Form.Group controlId={`editor-pref-${property}`}>
      <Form.Label>
        <Trans i18nKey={`editor.modal.preferences.${property}`}/>
      </Form.Label>
      <Form.Control
        as={property === EditorPreferenceProperty.INDENT_UNIT ? 'input' : 'select'}
        size='sm'
        value={selected as string | number}
        onChange={selectItem}
        type={property === EditorPreferenceProperty.INDENT_UNIT ? 'number' : ''}>
        { children }
      </Form.Control>
    </Form.Group>
  )
}
