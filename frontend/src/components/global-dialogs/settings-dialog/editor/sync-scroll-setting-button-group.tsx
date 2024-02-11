/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../../../hooks/common/use-application-state'
import { setEditorSyncScroll } from '../../../../redux/editor-config/methods'
import { OnOffButtonGroup } from '../utils/on-off-button-group'
import React from 'react'

/**
 * Allows to change if editor and rendering should scroll in sync.
 */
export const SyncScrollSettingButtonGroup: React.FC = () => {
  const enabled = useApplicationState((state) => state.editorConfig.syncScroll)
  return <OnOffButtonGroup value={enabled} onSelect={setEditorSyncScroll} name={'settings-sync-scroll'} />
}
