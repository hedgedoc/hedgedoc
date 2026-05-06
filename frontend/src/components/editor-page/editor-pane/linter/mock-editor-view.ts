/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { EditorState, Text } from '@codemirror/state'
import type { EditorView } from '@codemirror/view'
import { Mock } from 'ts-mockery'

/**
 * Mocks a CodeMirror editor view instance.
 * @param content The mocked content of the editor view
 * @returns A mocked editor view instance
 */
export const mockEditorView = (content: string): EditorView => {
  const docMock = Mock.of<Text>()
  docMock.toString = () => content
  return Mock.of<EditorView>({
    state: Mock.of<EditorState>({
      doc: docMock
    }),
    dispatch: jest.fn()
  })
}
