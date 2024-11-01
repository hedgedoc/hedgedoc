/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { usePrintIframe, usePrintSelf } from '../utils/print-iframe'
import { useCallback, useEffect, useMemo } from 'react'

/**
 * Hook to listen for the print keyboard shortcut and print the content of the renderer iframe.
 */
export const usePrintKeyboardShortcut = (): void => {
  const printCallbackOutside = usePrintIframe()
  const printCallbackInside = usePrintSelf()
  const isIframe = useMemo(() => window.top !== window.self, [])

  const handlePrint = useCallback(
    (event: KeyboardEvent): void => {
      if (event.key === 'p' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault()
        if (isIframe) {
          printCallbackInside()
        } else {
          printCallbackOutside()
        }
      }
    },
    [isIframe, printCallbackInside, printCallbackOutside]
  )

  useEffect(() => {
    window.addEventListener('keydown', handlePrint)

    return () => {
      window.removeEventListener('keydown', handlePrint)
    }
  }, [handlePrint])
}
