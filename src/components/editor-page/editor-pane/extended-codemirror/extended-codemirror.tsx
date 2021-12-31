/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import type { IControlledCodeMirror } from 'react-codemirror2'
import { Controlled } from 'react-codemirror2'
import './codemirror-imports'
import styles from './codemirror.module.scss'
import { allHinters, findWordAtCursor } from '../autocompletion'
import type { Editor } from 'codemirror'

export interface ExtendedCodemirrorProps extends Omit<IControlledCodeMirror, 'onChange'> {
  ligatures?: boolean
}

const onChange = (editor: Editor) => {
  const searchTerm = findWordAtCursor(editor)
  for (const hinter of allHinters) {
    if (hinter.wordRegExp.test(searchTerm.text)) {
      editor.showHint({
        container: editor.getWrapperElement(),
        hint: hinter.hint,
        completeSingle: false,
        completeOnSingleClick: false,
        alignWithWord: true
      })
      return
    }
  }
}

/**
 * A {@link Controlled controlled code mirror} but with several addons, different font, ligatures and other improvements.
 *
 * @param className Additional css class names that should be added to the component
 * @param ligatures Renders text ligatures if {@code true}
 * @param props Other code mirror props that will be forwarded to the editor
 */
export const ExtendedCodemirror: React.FC<ExtendedCodemirrorProps> = ({ className, ligatures, ...props }) => {
  return (
    <Controlled
      className={`${className ?? ''} ${ligatures ? '' : styles['no-ligatures']} ${styles['extended-codemirror']}`}
      onChange={onChange}
      {...props}
    />
  )
}
