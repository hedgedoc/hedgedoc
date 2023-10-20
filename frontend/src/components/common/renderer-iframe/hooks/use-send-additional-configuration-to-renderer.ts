/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../../../hooks/common/use-application-state'
import { useSendToRenderer } from '../../../render-page/window-post-message-communicator/hooks/use-send-to-renderer'
import { CommunicationMessageType } from '../../../render-page/window-post-message-communicator/rendering-message'
import { useMemo } from 'react'

/**
 * Sends additional configuration options (dark mode, line break, etc.) to the renderer.
 *
 * @param rendererReady Defines if the target renderer is ready
 */
export const useSendAdditionalConfigurationToRenderer = (rendererReady: boolean): void => {
  const darkModePreference = useApplicationState((state) => state.darkMode.darkModePreference)
  const newlinesAreBreaks = useApplicationState((state) => state.noteDetails?.frontmatter.newlinesAreBreaks)

  useSendToRenderer(
    useMemo(() => {
      return newlinesAreBreaks === undefined
        ? null
        : {
            type: CommunicationMessageType.SET_ADDITIONAL_CONFIGURATION,
            darkModePreference: darkModePreference,
            newLinesAreBreaks: newlinesAreBreaks
          }
    }, [darkModePreference, newlinesAreBreaks]),
    rendererReady
  )
}
