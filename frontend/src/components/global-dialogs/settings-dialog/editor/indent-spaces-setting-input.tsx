/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react'
import { Form } from 'react-bootstrap'
import { useApplicationState } from '../../../../hooks/common/use-application-state'
import { setEditorIndentSpaces } from '../../../../redux/editor-config/methods'
import { useCallback } from 'react'

/**
 * Input to change the number of spaces that are used for indentation in the editor.
 */
export const IndentSpacesSettingInput: React.FC = () => {
  const spaces = useApplicationState((state) => state.editorConfig.indentSpaces)

  const onChangeHandler = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value)
    if (value > 0) {
      setEditorIndentSpaces(value)
    }
  }, [])

  return <Form.Control className={'w-auto'} type={'number'} min={1} value={spaces} onChange={onChangeHandler} />
}
