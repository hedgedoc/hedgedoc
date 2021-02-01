/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react'
import { Form } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'

export enum EditorPreferenceInputType {
  SELECT,
  BOOLEAN,
  NUMBER
}

export interface EditorPreferenceInputProps {
  property: string
  type: EditorPreferenceInputType
  onChange: React.ChangeEventHandler<HTMLSelectElement>
  value?: string | number | string[]
}

export const EditorPreferenceInput: React.FC<EditorPreferenceInputProps> = ({ property, type, onChange, value, children }) => {
  useTranslation()
  return (
    <Form.Group controlId={`editor-pref-${property}`}>
      <Form.Label>
        <Trans i18nKey={`editor.modal.preferences.${property}${type===EditorPreferenceInputType.NUMBER ? '' : '.label'}`}/>
      </Form.Label>
      <Form.Control
        as={type === EditorPreferenceInputType.NUMBER ? 'input' : 'select'}
        size='sm'
        value={value}
        onChange={onChange}
        type={type === EditorPreferenceInputType.NUMBER ? 'number' : ''}>
        {children}
      </Form.Control>
    </Form.Group>
  )
}
