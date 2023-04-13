/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { allAppExtensions } from '../../../../extensions/extra-integrations/all-app-extensions'
import { useDarkModeState } from '../../../../hooks/common/use-dark-mode-state'
import { FrontmatterLinter } from './frontmatter-linter'
import type { Diagnostic } from '@codemirror/lint'
import { linter } from '@codemirror/lint'
import type { Extension } from '@codemirror/state'
import type { EditorView } from '@codemirror/view'
import { useMemo } from 'react'

/**
 * The Linter interface.
 *
 * This should be implemented by each linter we want to use.
 */
export interface Linter {
  lint(view: EditorView): Diagnostic[]
}

const createLinterExtension = () =>
  linter((view) =>
    allAppExtensions
      .flatMap((extension) => extension.buildCodeMirrorLinter())
      .concat(new FrontmatterLinter())
      .flatMap((aLinter) => aLinter.lint(view))
  )

/**
 * Creates a codemirror linter that runs all markdown extension linters.
 * Due to a bug in codemirror that breaks the "fix" buttons when switching themes, the extension is recreated if the app switches between dark and light mode.
 *
 * @return The build codemirror linter extension
 */
export const useLinter = (): Extension => {
  const darkModeActivated = useDarkModeState()

  return useMemo(() => (darkModeActivated ? createLinterExtension() : createLinterExtension()), [darkModeActivated])
}
