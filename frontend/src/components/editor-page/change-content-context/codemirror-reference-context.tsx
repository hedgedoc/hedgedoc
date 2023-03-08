/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { EditorView } from '@codemirror/view'
import { Optional } from '@mrdrogdrog/optional'
import type { PropsWithChildren } from 'react'
import React, { createContext, useContext, useState } from 'react'

type CodeMirrorReference = EditorView | undefined

const codemirrorReferenceContext = createContext<
  [CodeMirrorReference, (value: CodeMirrorReference) => void] | undefined
>(undefined)

/**
 * Provides the value from the {@link CodeMirrorReference code mirror reference} context.
 *
 * @return The {@link CodeMirrorReference} from the parent context.
 */
export const useCodemirrorReferenceContext = () => {
  return Optional.ofNullable(useContext(codemirrorReferenceContext)).orElseThrow(
    () => new Error('No codemirror reference received. Did you forget to use the provider component?')
  )
}

/**
 * Provides a context for the child components that contains a ref to the current code mirror instance and a callback that posts changes to this codemirror.
 */
export const ChangeEditorContentContextProvider: React.FC<PropsWithChildren<unknown>> = ({ children }) => {
  const [codeMirrorRef, setCodeMirrorRef] = useState<CodeMirrorReference>(undefined)

  return (
    <codemirrorReferenceContext.Provider value={[codeMirrorRef, setCodeMirrorRef]}>
      {children}
    </codemirrorReferenceContext.Provider>
  )
}
