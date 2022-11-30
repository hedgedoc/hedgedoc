/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { RendererType } from '../../../render-page/window-post-message-communicator/rendering-message'
import { useEffect, useRef } from 'react'

/**
 * Execute the given reload callback if the given render type changes.
 *
 * @param rendererType The render type to watch
 * @param effectCallback The callback that should be executed if the render type changes.
 */
export const useEffectOnRenderTypeChange = (rendererType: RendererType, effectCallback: () => void): void => {
  const lastRendererType = useRef<RendererType>(rendererType)

  useEffect(() => {
    if (lastRendererType.current === rendererType) {
      return
    }
    effectCallback()
    lastRendererType.current = rendererType
  }, [effectCallback, rendererType])
}
