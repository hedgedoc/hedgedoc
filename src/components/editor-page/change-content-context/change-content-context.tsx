/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { PropsWithChildren } from 'react'
import React, { createContext, useContext, useState } from 'react'
import Optional from 'optional-js'
import type { EditorView } from '@codemirror/view'
import type { ContentEdits } from '../editor-pane/tool-bar/formatters/types/changes'
import type { CursorSelection } from '../editor-pane/tool-bar/formatters/types/cursor-selection'

export type CodeMirrorReference = EditorView | undefined
type SetCodeMirrorReference = (value: CodeMirrorReference) => void

export type ContentFormatter = (parameters: {
  currentSelection: CursorSelection
  markdownContent: string
}) => [ContentEdits, CursorSelection | undefined]

type ChangeEditorContentContext = [CodeMirrorReference, SetCodeMirrorReference]

const changeEditorContentContext = createContext<ChangeEditorContentContext | undefined>(undefined)

/**
 * Extracts the code mirror reference from the parent context
 */
export const useCodeMirrorReference = (): CodeMirrorReference => {
  const contextContent = Optional.ofNullable(useContext(changeEditorContentContext)).orElseThrow(
    () => new Error('No change content received. Did you forget to use the provider component')
  )
  return contextContent[0]
}

/**
 * Extracts the code mirror reference from the parent context
 */
export const useSetCodeMirrorReference = (): SetCodeMirrorReference => {
  const contextContent = Optional.ofNullable(useContext(changeEditorContentContext)).orElseThrow(
    () => new Error('No change content received. Did you forget to use the provider component')
  )
  return contextContent[1]
}

/**
 * Provides a context for the child components that contains a ref to the current code mirror instance and a callback that posts changes to this codemirror.
 */
export const ChangeEditorContentContextProvider: React.FC<PropsWithChildren<unknown>> = ({ children }) => {
  const [codeMirrorRef, setCodeMirrorRef] = useState<CodeMirrorReference>(undefined)

  return (
    <changeEditorContentContext.Provider value={[codeMirrorRef, setCodeMirrorRef]}>
      {children}
    </changeEditorContentContext.Provider>
  )
}
