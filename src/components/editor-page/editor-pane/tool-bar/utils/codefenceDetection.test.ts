/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { ApplicationState } from '../../../../../redux/application-state'
import { initialState } from '../../../../../redux/note-details/initial-state'
import { isCursorInCodeFence } from './codefenceDetection'
import * as storeModule from '../../../../../redux'
import { Mock } from 'ts-mockery'

describe('Check whether cursor is in codefence', () => {
  const getGlobalStateMocked = jest.spyOn(storeModule, 'getGlobalState')

  const mockRedux = (content: string, line: number): void => {
    const contentLines = content.split('\n')
    getGlobalStateMocked.mockImplementation(() =>
      Mock.from<ApplicationState>({
        noteDetails: {
          ...initialState,
          selection: {
            from: {
              line: line,
              character: 0
            }
          },
          markdownContentLines: contentLines,
          markdownContent: content
        }
      })
    )
  }

  beforeEach(() => {
    jest.resetModules()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('returns false for empty document', () => {
    mockRedux('', 0)
    expect(isCursorInCodeFence()).toBe(false)
  })

  it('returns true with one open codefence directly above', () => {
    mockRedux('```\n', 1)
    expect(isCursorInCodeFence()).toBe(true)
  })

  it('returns true with one open codefence and empty lines above', () => {
    mockRedux('```\n\n\n', 3)
    expect(isCursorInCodeFence()).toBe(true)
  })

  it('returns false with one completed codefence above', () => {
    mockRedux('```\n\n```\n', 3)
    expect(isCursorInCodeFence()).toBe(false)
  })

  it('returns true with one completed and one open codefence above', () => {
    mockRedux('```\n\n```\n\n```\n\n', 6)
    expect(isCursorInCodeFence()).toBe(true)
  })
})
