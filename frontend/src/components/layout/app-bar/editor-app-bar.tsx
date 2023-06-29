/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../../hooks/common/use-application-state'
import { RealtimeConnectionAlert } from '../../editor-page/realtime-connection-alert/realtime-connection-alert'
import { NoteTitleElement } from './app-bar-elements/note-title-element/note-title-element'
import { BaseAppBar } from './base-app-bar'
import React from 'react'

/**
 * Renders the EditorAppBar that extends the {@link BaseAppBar} with the note title or realtime connection alert.
 */
export const EditorAppBar: React.FC = () => {
  const isSynced = useApplicationState((state) => state.realtimeStatus.isSynced)

  return <BaseAppBar>{isSynced ? <NoteTitleElement /> : <RealtimeConnectionAlert />}</BaseAppBar>
}
