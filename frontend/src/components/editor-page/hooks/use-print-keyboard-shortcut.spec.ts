/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { fireEvent, renderHook } from '@testing-library/react'
import { usePrintIframeKeyboardShortcut, usePrintSelfKeyboardShortcut } from './use-print-keyboard-shortcut'

const printIframe = jest.fn()
const printSelf = jest.fn()

jest.mock('../utils/print-iframe', () => ({
  usePrintIframe: () => printIframe,
  usePrintSelf: () => printSelf
}))

describe('usePrintKeyboardShortcut', () => {
  beforeEach(() => {
    printIframe.mockClear()
    printSelf.mockClear()
  })

  it('prints the renderer iframe when the print shortcut is pressed', () => {
    renderHook(() => usePrintIframeKeyboardShortcut())

    fireEvent.keyDown(window, { ctrlKey: true, key: 'p' })

    expect(printIframe).toHaveBeenCalledTimes(1)
    expect(printSelf).not.toHaveBeenCalled()
  })

  it('prints the current window when the print shortcut is pressed in the renderer iframe', () => {
    renderHook(() => usePrintSelfKeyboardShortcut())

    fireEvent.keyDown(window, { ctrlKey: true, key: 'p' })

    expect(printSelf).toHaveBeenCalledTimes(1)
    expect(printIframe).not.toHaveBeenCalled()
  })
})
