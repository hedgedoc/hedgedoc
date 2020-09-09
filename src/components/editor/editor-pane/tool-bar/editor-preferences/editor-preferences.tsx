import { EditorConfiguration } from 'codemirror'
import equal from 'fast-deep-equal'
import React, { Fragment, useCallback, useState } from 'react'
import { Button, Form, ListGroup } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { ApplicationState } from '../../../../../redux'
import { setEditorPreferences } from '../../../../../redux/editor/methods'
import { ForkAwesomeIcon } from '../../../../common/fork-awesome/fork-awesome-icon'
import { CommonModal } from '../../../../common/modals/common-modal'
import { EditorPreferenceProperty, EditorPreferenceSelect } from './editor-preference-select'

export const EditorPreferences: React.FC = () => {
  const { t } = useTranslation()
  const [showModal, setShowModal] = useState(false)
  const preferences = useSelector((state: ApplicationState) => state.editorConfig.preferences, equal)

  const sendPreferences = useCallback((newPreferences: EditorConfiguration) => {
    setEditorPreferences(newPreferences)
  }, [])

  return (
    <Fragment>
      <Button variant='light' onClick={() => setShowModal(true)} title={t('editor.editorToolbar.preferences')}>
        <ForkAwesomeIcon icon="wrench"/>
      </Button>
      <CommonModal
        show={showModal}
        onHide={() => setShowModal(false)}
        titleI18nKey={'editor.modal.preferences.title'}
        closeButton={true}
        icon={'wrench'}>
        <Form>
          <ListGroup>
            <ListGroup.Item>
              <EditorPreferenceSelect onChange={sendPreferences} preferences={preferences} property={EditorPreferenceProperty.THEME}>
                <option value='one-dark'>Dark</option>
                <option value='neat'>Light</option>
              </EditorPreferenceSelect>
            </ListGroup.Item>
            <ListGroup.Item>
              <EditorPreferenceSelect onChange={sendPreferences} preferences={preferences} property={EditorPreferenceProperty.KEYMAP}>
                <option value='sublime'>Sublime</option>
                <option value='emacs'>Emacs</option>
                <option value='vim'>Vim</option>
              </EditorPreferenceSelect>
            </ListGroup.Item>
            <ListGroup.Item>
              <EditorPreferenceSelect onChange={sendPreferences} preferences={preferences} property={EditorPreferenceProperty.INDENT_WITH_TABS}>
                <option value='false'>Spaces</option>
                <option value='true'>Tab</option>
              </EditorPreferenceSelect>
            </ListGroup.Item>
            <ListGroup.Item>
              <EditorPreferenceSelect onChange={sendPreferences} preferences={preferences} property={EditorPreferenceProperty.INDENT_UNIT}/>
            </ListGroup.Item>
            <ListGroup.Item>
              <Form.Group controlId='editorSpellChecker'>
                <Form.Label>
                  <Trans i18nKey='editor.modal.preferences.spellChecker'/>
                </Form.Label>
                <Form.Control as='select' size='sm' onChange={() => alert('This feature is not yet implemented.')}>
                  <option value='off'>off</option>
                  <option value='en'>English</option>
                </Form.Control>
              </Form.Group>
            </ListGroup.Item>
          </ListGroup>
        </Form>
      </CommonModal>
    </Fragment>
  )
}
