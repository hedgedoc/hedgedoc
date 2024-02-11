/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../../../hooks/common/use-application-state'
import { setEditorSpellCheck } from '../../../../redux/editor-config/methods'
import { OnOffButtonGroup } from '../utils/on-off-button-group'
import React from 'react'

/**
 * Allows to change whether spellchecking is enabled or not in the editor.
 */
export const SpellcheckSettingButtonGroup: React.FC = () => {
  const enabled = useApplicationState((state) => state.editorConfig.spellCheck)
  return <OnOffButtonGroup value={enabled} onSelect={setEditorSpellCheck} name={'settings-spell-check'} />
}
