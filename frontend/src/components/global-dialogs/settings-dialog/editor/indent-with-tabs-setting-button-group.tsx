/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../../../hooks/common/use-application-state'
import { setEditorIndentWithTabs } from '../../../../redux/editor-config/methods'
import { OnOffButtonGroup } from '../utils/on-off-button-group'
import React from 'react'

/**
 * Allows to change whether spellchecking is enabled or not in the editor.
 */
export const IndentWithTabsSettingButtonGroup: React.FC = () => {
  const enabled = useApplicationState((state) => state.editorConfig.indentWithTabs)
  return (
    <OnOffButtonGroup
      value={enabled}
      name={'settings-indent-with-tabs'}
      onSelect={setEditorIndentWithTabs}
      overrideButtonOnI18nKey={'settings.editor.indentWithTabs.tabs'}
      overrideButtonOffI18nKey={'settings.editor.indentWithTabs.spaces'}
    />
  )
}
