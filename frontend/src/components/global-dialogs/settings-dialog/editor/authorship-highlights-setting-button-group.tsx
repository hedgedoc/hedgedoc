/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../../../hooks/common/use-application-state'
import React, { useCallback } from 'react'
import { SettingsToggleButton } from '../utils/settings-toggle-button'
import { ToggleButtonGroup } from 'react-bootstrap'
import { AuthorshipHighlightMode } from '../../../../redux/editor-config/types'
import { setAuthorshipHighlightMode } from '../../../../redux/editor-config/methods'

/**
 * Allows to change whether spellchecking is enabled or not in the editor.
 */
export const AuthorshipHighlightModeSettingButtonGroup: React.FC = () => {
  const state = useApplicationState((state) => state.editorConfig.authorshipHighlightMode)
  const onButtonSelect = useCallback((newValue: AuthorshipHighlightMode) => {
    setAuthorshipHighlightMode(newValue)
  }, [])

  return (
    <ToggleButtonGroup type='radio' name={'authorship-highlight-mode'} value={state}>
      <SettingsToggleButton
        onSelect={onButtonSelect}
        selected={state === AuthorshipHighlightMode.NONE}
        value={AuthorshipHighlightMode.NONE}
        i18nKeyLabel={'settings.editor.authorshipHighlightMode.none'}
        i18nKeyTooltip={'settings.editor.authorshipHighlightMode.noneHelp'}
      />
      <SettingsToggleButton
        onSelect={onButtonSelect}
        selected={state === AuthorshipHighlightMode.UNDERLINE}
        value={AuthorshipHighlightMode.UNDERLINE}
        i18nKeyLabel={'settings.editor.authorshipHighlightMode.underline'}
        i18nKeyTooltip={'settings.editor.authorshipHighlightMode.underlineHelp'}
      />
      <SettingsToggleButton
        onSelect={onButtonSelect}
        selected={state === AuthorshipHighlightMode.BACKGROUND}
        value={AuthorshipHighlightMode.BACKGROUND}
        i18nKeyLabel={'settings.editor.authorshipHighlightMode.background'}
        i18nKeyTooltip={'settings.editor.authorshipHighlightMode.backgroundHelp'}
      />
    </ToggleButtonGroup>
  )
}
