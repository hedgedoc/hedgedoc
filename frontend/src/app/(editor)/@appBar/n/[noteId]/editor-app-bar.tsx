'use client'

/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { RealtimeConnectionAlert } from '../../../../../components/editor-page/realtime-connection-alert/realtime-connection-alert'
import { NoteTitleElement } from '../../../../../components/layout/app-bar/app-bar-elements/note-title-element/note-title-element'
import { BaseAppBar } from '../../../../../components/layout/app-bar/base-app-bar'
import { useApplicationState } from '../../../../../hooks/common/use-application-state'
import React from 'react'

/**
 * Renders the EditorAppBar that extends the {@link BaseAppBar} with the note title or realtime connection alert.
 */
export const EditorAppBar: React.FC = () => {
  const isSynced = useApplicationState((state) => state.realtimeStatus.isSynced)

  return <BaseAppBar>{isSynced ? <NoteTitleElement /> : <RealtimeConnectionAlert />}</BaseAppBar>
}
