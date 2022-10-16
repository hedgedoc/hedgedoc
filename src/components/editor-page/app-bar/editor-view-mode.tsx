/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { Button, ButtonGroup } from 'react-bootstrap'
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
    <ButtonGroup>
      <Button
        {...cypressId('view-mode-editor')}
        onClick={() => setEditorMode(EditorMode.EDITOR)}
        variant={editorMode === EditorMode.EDITOR ? 'secondary' : 'outline-secondary'}
        title={t('editor.viewMode.edit')}>
        <ForkAwesomeIcon icon='pencil' />
      </Button>
      <Button
        {...cypressId('view-mode-both')}
        onClick={() => setEditorMode(EditorMode.BOTH)}
        variant={editorMode === EditorMode.BOTH ? 'secondary' : 'outline-secondary'}
        title={t('editor.viewMode.both')}>
        <ForkAwesomeIcon icon='columns' />
      </Button>
      <Button
        {...cypressId('view-mode-preview')}
        onClick={() => setEditorMode(EditorMode.PREVIEW)}
        variant={editorMode === EditorMode.PREVIEW ? 'secondary' : 'outline-secondary'}
        title={t('editor.viewMode.view')}>
        <ForkAwesomeIcon icon='eye' />
      </Button>
    </ButtonGroup>
  )
}
