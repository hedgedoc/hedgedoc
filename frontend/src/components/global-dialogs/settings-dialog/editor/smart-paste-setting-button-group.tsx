/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../../../hooks/common/use-application-state'
import { setEditorSmartPaste } from '../../../../redux/editor-config/methods'
import { OnOffButtonGroup } from '../utils/on-off-button-group'
import React from 'react'

/**
 * Allows to change if smart paste should be used in the editor.
 */
export const SmartPasteSettingButtonGroup: React.FC = () => {
  const enabled = useApplicationState((state) => state.editorConfig.smartPaste)
  return <OnOffButtonGroup value={enabled} onSelect={setEditorSmartPaste} name={'settings-smart-paste'} />
}
