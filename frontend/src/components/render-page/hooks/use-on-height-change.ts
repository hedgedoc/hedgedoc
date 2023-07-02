/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import useResizeObserver from '@react-hook/resize-observer'
import type { RefObject } from 'react'
import { useEffect, useRef, useState } from 'react'

/**
 * Monitors the height of the referenced {@link HTMLElement} and executes the callback on change.
 *
 * @param elementRef The reference that contains the element to watch
 * @param onHeightChange The callback that should be executed if the height changes
 */
export const useOnHeightChange = (
  elementRef: RefObject<HTMLElement>,
  onHeightChange: undefined | ((value: number) => void)
): void => {
  const [rendererSize, setRendererSize] = useState<number>(0)
  const lastPostedSize = useRef<number>(0)
  useResizeObserver(elementRef, (entry) => {
    setRendererSize(entry.contentRect.height)
  })
  useEffect(() => {
    const value = elementRef.current?.clientHeight
    if (value === undefined) {
      return
    }
    setRendererSize(value)
  }, [elementRef])
  useEffect(() => {
    if (lastPostedSize.current === rendererSize) {
      return
    }
    lastPostedSize.current = rendererSize
    onHeightChange?.(rendererSize + 1)
  })
}
