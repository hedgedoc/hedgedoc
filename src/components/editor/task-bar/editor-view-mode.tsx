import { ToggleButton, ToggleButtonGroup } from 'react-bootstrap'
import React from 'react'
import { useSelector } from 'react-redux'
import { ForkAwesomeIcon } from '../../../fork-awesome/fork-awesome-icon'
import { ApplicationState } from '../../../redux'
import { EditorMode } from '../../../redux/editor/types'
import { setEditorModeConfig } from '../../../redux/editor/methods'
import { useTranslation } from 'react-i18next'

const EditorViewMode: React.FC = () => {
  const { t } = useTranslation()
  const editorConfig = useSelector((state: ApplicationState) => state.editorConfig)
  return (
    <ToggleButtonGroup
      type="radio"
      name="options"
      defaultValue={editorConfig.editorMode}
      onChange={(value: EditorMode) => { setEditorModeConfig(value) }}>
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

export { EditorViewMode }
