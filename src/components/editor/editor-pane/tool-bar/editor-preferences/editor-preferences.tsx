/*
SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: AGPL-3.0-only
*/

import equal from "fast-deep-equal"
import React, { Fragment, useState } from 'react'
import { Button, Form, ListGroup } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { ApplicationState } from '../../../../../redux'
import { ForkAwesomeIcon } from '../../../../common/fork-awesome/fork-awesome-icon'
import { CommonModal } from '../../../../common/modals/common-modal'
import { ShowIf } from '../../../../common/show-if/show-if'
import { EditorPreferenceBooleanProperty } from './editor-preference-boolean-property'
import { EditorPreferenceInput, EditorPreferenceInputType } from './editor-preference-input'
import { EditorPreferenceLigaturesSelect } from './editor-preference-ligatures-select'
import { EditorPreferenceNumberProperty } from './editor-preference-number-property'
import { EditorPreferenceProperty } from "./editor-preference-property"
import { EditorPreferenceSelectProperty } from "./editor-preference-select-property"

export const EditorPreferences: React.FC = () => {
  const { t } = useTranslation()
  const [showModal, setShowModal] = useState(false)
  const indentWithTabs = useSelector((state: ApplicationState) => state.editorConfig.preferences.indentWithTabs ?? false, equal)

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
              <EditorPreferenceSelectProperty property={EditorPreferenceProperty.THEME} selections={['one-dark', 'neat']}/>
            </ListGroup.Item>
            <ListGroup.Item>
              <EditorPreferenceSelectProperty property={EditorPreferenceProperty.KEYMAP} selections={['sublime', 'emacs', 'vim']}/>
            </ListGroup.Item>
            <ListGroup.Item>
              <EditorPreferenceBooleanProperty property={EditorPreferenceProperty.INDENT_WITH_TABS}/>
            </ListGroup.Item>
            <ShowIf condition={!indentWithTabs}>
              <ListGroup.Item>
                <EditorPreferenceNumberProperty property={EditorPreferenceProperty.INDENT_UNIT}/>
              </ListGroup.Item>
            </ShowIf>
            <ListGroup.Item>
              <EditorPreferenceLigaturesSelect/>
            </ListGroup.Item>
            <ListGroup.Item>
              <EditorPreferenceInput onChange={() => alert('This feature is not yet implemented.')} property={EditorPreferenceProperty.SPELL_CHECK} type={EditorPreferenceInputType.SELECT}>
                <option value='off'>Off</option>
                <option value='en'>English</option>
              </EditorPreferenceInput>
            </ListGroup.Item>
          </ListGroup>
        </Form>
      </CommonModal>
    </Fragment>
  )
}
