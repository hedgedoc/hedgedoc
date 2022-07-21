/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { ToggleButton, ToggleButtonGroup } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { setEditorMode } from '../../../redux/editor/methods'
import { ForkAwesomeIcon } from '../../common/fork-awesome/fork-awesome-icon'
import { useApplicationState } from '../../../hooks/common/use-application-state'
import { cypressId } from '../../../utils/cypress-attribute'

export enum EditorMode {
  PREVIEW = 'view',
  BOTH = 'both',
  EDITOR = 'edit'
}

/**
 * Renders the button group to set the editor mode.
 * @see EditorMode
 */
export const EditorViewMode: React.FC = () => {
  const { t } = useTranslation()
  const editorMode = useApplicationState((state) => state.editorConfig.editorMode)

  return (
    <ToggleButtonGroup
      type='radio'
      name='options'
      value={editorMode}
      onChange={(value: EditorMode) => {
        setEditorMode(value)
      }}>
      <ToggleButton
        {...cypressId('view-mode-editor')}
        value={EditorMode.EDITOR}
        variant='outline-secondary'
        title={t('editor.viewMode.edit')}>
        <ForkAwesomeIcon icon='pencil' />
      </ToggleButton>
      <ToggleButton
        {...cypressId('view-mode-both')}
        value={EditorMode.BOTH}
        variant='outline-secondary'
        title={t('editor.viewMode.both')}>
        <ForkAwesomeIcon icon='columns' />
      </ToggleButton>
      <ToggleButton
        {...cypressId('view-mode-preview')}
        value={EditorMode.PREVIEW}
        variant='outline-secondary'
        title={t('editor.viewMode.view')}>
        <ForkAwesomeIcon icon='eye' />
      </ToggleButton>
    </ToggleButtonGroup>
  )
}
