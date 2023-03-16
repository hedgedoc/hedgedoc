/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ModalVisibilityProps } from '../../../common/modals/common-modal'
import { CommonModal } from '../../../common/modals/common-modal'
import { LinksTabContent } from './links-tab-content'
import { ShortcutTabContent } from './shortcuts-tab-content'
import React, { useMemo, useState } from 'react'
import { Button, Modal } from 'react-bootstrap'
import { QuestionCircle as IconQuestionCircle } from 'react-bootstrap-icons'
import { Trans, useTranslation } from 'react-i18next'

export enum HelpTabStatus {
  Shortcuts = 'shortcuts.title',
  Links = 'links.title'
}

/**
 * Renders the help modal.
 * This modal shows the user the markdown cheatsheet, shortcuts and different links with further help.
 *
 * @see CheatsheetTabContent
 * @see ShortcutTabContent
 * @see LinksTabContent
 *
 * @param show If the modal should be shown
 * @param onHide A callback when the modal should be closed again
 */
export const HelpModal: React.FC<ModalVisibilityProps> = ({ show, onHide }) => {
  const [tab, setTab] = useState<HelpTabStatus>(HelpTabStatus.Shortcuts)
  const { t } = useTranslation()

  const tabContent = useMemo(() => {
    switch (tab) {
      case HelpTabStatus.Shortcuts:
        return <ShortcutTabContent />
      case HelpTabStatus.Links:
        return <LinksTabContent />
    }
  }, [tab])

  const modalTitle = useMemo(() => t('editor.documentBar.help') + ' - ' + t(`editor.help.${tab}`), [t, tab])

  return (
    <CommonModal modalSize={'xl'} titleIcon={IconQuestionCircle} show={show} onHide={onHide} title={modalTitle}>
      <Modal.Body>
        <nav className='nav nav-tabs'>
          <Button
            variant={'light'}
            className={`nav-link nav-item ${tab === HelpTabStatus.Shortcuts ? 'active' : ''}`}
            onClick={() => setTab(HelpTabStatus.Shortcuts)}>
            <Trans i18nKey={'editor.help.shortcuts.title'} />
          </Button>
          <Button
            variant={'light'}
            className={`nav-link nav-item ${tab === HelpTabStatus.Links ? 'active' : ''}`}
            onClick={() => setTab(HelpTabStatus.Links)}>
            <Trans i18nKey={'editor.help.links.title'} />
          </Button>
        </nav>
        {tabContent}
      </Modal.Body>
    </CommonModal>
  )
}
