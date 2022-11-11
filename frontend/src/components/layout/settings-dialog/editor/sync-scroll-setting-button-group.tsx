/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { OnOffButtonGroup } from '../utils/on-off-button-group'
import { useApplicationState } from '../../../../hooks/common/use-application-state'
import { setEditorSyncScroll } from '../../../../redux/editor/methods'

/**
 * Allows to change if editor and rendering should scroll in sync.
 */
export const SyncScrollSettingButtonGroup: React.FC = () => {
  const enabled = useApplicationState((state) => state.editorConfig.syncScroll)
  return <OnOffButtonGroup value={enabled} onSelect={setEditorSyncScroll} />
}
