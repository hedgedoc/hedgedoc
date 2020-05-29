import { ToggleButton, ToggleButtonGroup } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { useSelector } from 'react-redux'
import { ApplicationState } from '../../../redux'
import { EditorMode } from '../../../redux/editor/types'
import { setEditorModeConfig } from '../../../redux/editor/methods'

const EditorViewMode: React.FC = () => {
  const editorConfig = useSelector((state: ApplicationState) => state.editorConfig)
  return (
    <ToggleButtonGroup
      type="radio"
      name="options"
      defaultValue={editorConfig.editorMode}
      onChange={(value: EditorMode) => { setEditorModeConfig(value) }}>
      <ToggleButton value={EditorMode.PREVIEW} variant="outline-secondary">
        <FontAwesomeIcon icon="eye"/>
      </ToggleButton>
      <ToggleButton value={EditorMode.BOTH} variant="outline-secondary">
        <FontAwesomeIcon icon="columns"/>
      </ToggleButton>
      <ToggleButton value={EditorMode.EDITOR} variant="outline-secondary">
        <FontAwesomeIcon icon="pencil-alt"/>
      </ToggleButton>
    </ToggleButtonGroup>
  )
}

export { EditorViewMode }
