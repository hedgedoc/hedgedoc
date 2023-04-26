/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../../../hooks/common/use-application-state'
import { DarkModePreference } from '../../../../redux/dark-mode/types'
import { useSendToRenderer } from '../../../render-page/window-post-message-communicator/hooks/use-send-to-renderer'
import { CommunicationMessageType } from '../../../render-page/window-post-message-communicator/rendering-message'
import { useMemo } from 'react'

/**
 * Sends additional configuration options (dark mode, line break, etc.) to the renderer.
 *
 * @param rendererReady Defines if the target renderer is ready
 * @param forcedDarkMode Overwrites the value from the global application states if set.
 */
export const useSendAdditionalConfigurationToRenderer = (
  rendererReady: boolean,
  forcedDarkMode: DarkModePreference = DarkModePreference.AUTO
): void => {
  const darkModePreference = useApplicationState((state) => state.darkMode.darkModePreference)
  const newlinesAreBreaks = useApplicationState((state) => state.noteDetails.frontmatter.newlinesAreBreaks)

  const darkMode = useMemo(() => {
    return forcedDarkMode === DarkModePreference.AUTO ? darkModePreference : forcedDarkMode
  }, [darkModePreference, forcedDarkMode])

  useSendToRenderer(
    useMemo(
      () => ({
        type: CommunicationMessageType.SET_ADDITIONAL_CONFIGURATION,
        darkModePreference: darkMode,
        newLinesAreBreaks: newlinesAreBreaks
      }),
      [darkMode, newlinesAreBreaks]
    ),
    rendererReady
  )
}
