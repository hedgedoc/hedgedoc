/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMemo } from 'react'
import { CommunicationMessageType } from '../../../render-page/window-post-message-communicator/rendering-message'
import { useSendToRenderer } from '../../../render-page/window-post-message-communicator/hooks/use-send-to-renderer'
import { useApplicationState } from '../../../../hooks/common/use-application-state'

/**
 * Sends the current dark mode setting to the renderer.
 *
 * @param forcedDarkMode Overwrites the value from the global application states if set.
 * @param rendererReady Defines if the target renderer is ready
 */
export const useSendDarkModeStatusToRenderer = (forcedDarkMode: boolean | undefined, rendererReady: boolean): void => {
  const darkModePreference = useApplicationState((state) => state.darkMode.darkModePreference)

  useSendToRenderer(
    useMemo(
      () => ({
        type: CommunicationMessageType.SET_DARKMODE,
        preference: darkModePreference
      }),
      [darkModePreference]
    ),
    rendererReady
  )
}
