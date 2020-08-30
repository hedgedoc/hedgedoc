import React from 'react'
import { ToggleButton, ToggleButtonGroup } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { ApplicationState } from '../../../redux'
import { setEditorMode } from '../../../redux/editor/methods'
import { ForkAwesomeIcon } from '../../common/fork-awesome/fork-awesome-icon'

export enum EditorMode {
  PREVIEW,
  BOTH,
  EDITOR,
}

export const EditorViewMode: React.FC = () => {
  const { t } = useTranslation()
  const editorMode = useSelector((state: ApplicationState) => state.editorConfig.editorMode)
  return (
    <ToggleButtonGroup
      type="radio"
      name="options"
      value={editorMode}
      onChange={(value: EditorMode) => {
        setEditorMode(value)
      }}>
      <ToggleButton value={EditorMode.PREVIEW} variant="outline-secondary" title={t('editor.viewMode.view')}>
        <ForkAwesomeIcon icon="eye"/>
      </ToggleButton>
      <ToggleButton value={EditorMode.BOTH} variant="outline-secondary" title={t('editor.viewMode.both')}>
        <ForkAwesomeIcon icon="columns"/>
      </ToggleButton>
      <ToggleButton value={EditorMode.EDITOR} variant="outline-secondary" title={t('editor.viewMode.edit')}>
        <ForkAwesomeIcon icon="pencil"/>
      </ToggleButton>
    </ToggleButtonGroup>
  )
}
