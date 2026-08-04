/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { usePrintIframe, usePrintSelf } from '../utils/print-iframe'
import { useCallback, useEffect } from 'react'

/**
 * Hook to listen for the print keyboard shortcut and print the content of the renderer iframe.
 */
export const usePrintIframeKeyboardShortcut = (): void => {
  const printIframe = usePrintIframe()
  usePrintShortcut(printIframe)
}

/**
 * Hook to listen for the print keyboard shortcut and print the renderer content from within the iframe.
 */
export const usePrintSelfKeyboardShortcut = (): void => {
  const printSelf = usePrintSelf()
  usePrintShortcut(printSelf)
}

const usePrintShortcut = (print: () => void): void => {
  const handlePrint = useCallback(
    (event: KeyboardEvent): void => {
      if (event.key === 'p' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault()
        print()
      }
    },
    [print]
  )

  useEffect(() => {
    window.addEventListener('keydown', handlePrint)

    return () => {
      window.removeEventListener('keydown', handlePrint)
    }
  }, [handlePrint])
}
