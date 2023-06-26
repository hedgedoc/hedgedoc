/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useTranslatedText } from '../../../hooks/common/use-translated-text'
import type { CommonModalProps } from '../../common/modals/common-modal'
import { CommonModal } from '../../common/modals/common-modal'
import { EditorSettingsTabContent } from './editor/editor-settings-tab-content'
import { GlobalSettingsTabContent } from './global/global-settings-tab-content'
import React from 'react'
import { Modal, Tab, Tabs } from 'react-bootstrap'
import { Gear as IconGear } from 'react-bootstrap-icons'

/**
 * Shows global and scope specific settings
 *
 * @param show if the modal should be visible
 * @param onHide callback that is executed if the modal should be closed
 */
export const SettingsModal: React.FC<CommonModalProps> = ({ show, onHide }) => {
  const globalLabelTitle = useTranslatedText('settings.global.label')
  const editorLabelTitle = useTranslatedText('settings.editor.label')

  return (
    <CommonModal
      show={show}
      modalSize={'lg'}
      onHide={onHide}
      titleIcon={IconGear}
      titleI18nKey={'settings.title'}
      showCloseButton={true}>
      <Modal.Body>
        <Tabs navbar={false} variant={'tabs'} defaultActiveKey={'global'}>
          <Tab title={globalLabelTitle} eventKey={'global'}>
            <GlobalSettingsTabContent />
          </Tab>
          <Tab title={editorLabelTitle} eventKey={'editor'}>
            <EditorSettingsTabContent />
          </Tab>
        </Tabs>
      </Modal.Body>
    </CommonModal>
  )
}
