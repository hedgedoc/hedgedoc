/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../../../hooks/common/use-application-state'
import { setEditorLigatures } from '../../../../redux/editor-config/methods'
import { OnOffButtonGroup } from '../utils/on-off-button-group'
import React from 'react'

/**
 * Allows to change if ligatures should be used or not in the editor.
 */
export const LigatureSettingButtonGroup: React.FC = () => {
  const enabled = useApplicationState((state) => state.editorConfig.ligatures)
  return <OnOffButtonGroup value={enabled} onSelect={setEditorLigatures} name={'settings-ligatures'} />
}
