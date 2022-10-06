/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useIsDarkModeActivated } from '../../../../hooks/common/use-is-dark-mode-activated'
import { useMemo } from 'react'
import { CommunicationMessageType } from '../../../render-page/window-post-message-communicator/rendering-message'
import { useSendToRenderer } from '../../../render-page/window-post-message-communicator/hooks/use-send-to-renderer'

/**
 * Sends the current dark mode setting to the renderer.
 *
 * @param forcedDarkMode Overwrites the value from the global application states if set.
 * @param rendererReady Defines if the target renderer is ready
 */
export const useSendDarkModeStatusToRenderer = (forcedDarkMode: boolean | undefined, rendererReady: boolean): void => {
  const savedDarkMode = useIsDarkModeActivated()

  useSendToRenderer(
    useMemo(
      () => ({
        type: CommunicationMessageType.SET_DARKMODE,
        activated: forcedDarkMode ?? savedDarkMode
      }),
      [forcedDarkMode, savedDarkMode]
    ),
    rendererReady
  )
}
