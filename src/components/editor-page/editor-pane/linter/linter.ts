/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Diagnostic } from '@codemirror/lint'
import { linter } from '@codemirror/lint'
import { useMemo } from 'react'
import type { Extension } from '@codemirror/state'
import type { EditorView } from '@codemirror/view'

/**
 * The Linter interface.
 *
 * This should be implemented by each linter we want to use.
 */
export interface Linter {
  lint(view: EditorView): Diagnostic[]
}

/**
 * The hook to create a single codemirror linter from all our linters.
 *
 * @param linters The {@link Linter linters} to use for the codemirror linter.
 * @return The build codemirror linter
 */
export const useLinter = (linters: Linter[]): Extension => {
  return useMemo(() => linter((view) => linters.flatMap((aLinter) => aLinter.lint(view))), [linters])
}
