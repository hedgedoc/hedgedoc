/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getGlobalState } from '../../../../../redux'
import { isMockMode } from '../../../../../utils/test-modes'
import { MockConnection } from './mock-connection'
import type { YDocMessageTransporter } from '@hedgedoc/realtime'
import { useEffect } from 'react'

/**
 * When in mock mode this effect inserts the current markdown content into the yDoc of the given connection to simulate a sync from the server.
 * This should happen only one time because after that the editor writes its changes into the yText which writes it into the redux.
 *
 * Usually the CodeMirror gets its content from yjs sync via websocket. But in mock mode this connection isn't available.
 * That's why this hook inserts the current markdown content, that is currently saved in the global application state
 * and was saved there by the {@link NoteLoadingBoundary note loading boundary}, into the y-text to write it into the codemirror.
 * This has to be done AFTER the CodeMirror sync extension (yCollab) has been loaded because the extension reacts only to updates of the yText
 * and doesn't write the existing content into the editor when being loaded.
 *
 * @param connection The connection into whose yDoc the content should be written
 * @param firstUpdateHappened Defines if the first update already happened
 */
export const useInsertNoteContentIntoYTextInMockModeEffect = (
  firstUpdateHappened: boolean,
  connection: YDocMessageTransporter
): void => {
  useEffect(() => {
    if (firstUpdateHappened && isMockMode && connection instanceof MockConnection) {
      connection.simulateFirstSync(getGlobalState().noteDetails.markdownContent.plain)
    }
  }, [firstUpdateHappened, connection])
}
