/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../../../hooks/common/use-application-state'
import { setEditorLineWrapping } from '../../../../redux/editor-config/methods'
import { OnOffButtonGroup } from '../utils/on-off-button-group'
import React from 'react'

/**
 * Allows to change if line wrapping should be used or not in the editor.
 */
export const LineWrappingSettingButtonGroup: React.FC = () => {
  const enabled = useApplicationState((state) => state.editorConfig.lineWrapping)
  return <OnOffButtonGroup value={enabled} onSelect={setEditorLineWrapping} name={'settings-line-wrapping'} />
}
