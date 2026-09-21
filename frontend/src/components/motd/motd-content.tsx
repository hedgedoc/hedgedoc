/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { RendererIframe } from '../common/renderer-iframe/renderer-iframe'
import { RendererType } from '../render-page/window-post-message-communicator/rendering-message'
import { useMotdContextValue } from './motd-context'
import { useMemo } from 'react'

/**
 * Displays the content of the motd.
 */
export const MotdContent: React.FC = () => {
  const contextValue = useMotdContextValue()

  const lines = useMemo(() => {
    const rawLines = contextValue?.motdText.split('\n')
    if (rawLines === undefined || rawLines.length === 0) {
      return []
    }
    return rawLines
  }, [contextValue?.motdText])

  return (
    <RendererIframe
      frameClasses={'w-100'}
      rendererType={RendererType.SIMPLE}
      markdownContentLines={lines}
      adaptFrameHeightToContent={true}
      showWaitSpinner={true}
    />
  )
}
