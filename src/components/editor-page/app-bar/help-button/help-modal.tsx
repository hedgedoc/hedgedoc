/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Button, Modal } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import React, { useMemo, useState } from 'react'
import { CommonModal } from '../../../common/modals/common-modal'
import { Shortcut } from './shortcuts'
import { Links } from './links'
import { Cheatsheet } from './cheatsheet'

export enum HelpTabStatus {
  Cheatsheet = 'cheatsheet.title',
  Shortcuts = 'shortcuts.title',
  Links = 'links.title'
}

export interface HelpModalProps {
  show: boolean
  onHide: () => void
}

export const HelpModal: React.FC<HelpModalProps> = ({ show, onHide }) => {
  const [tab, setTab] = useState<HelpTabStatus>(HelpTabStatus.Cheatsheet)
  const { t } = useTranslation()

  const tabContent = useMemo(() => {
    switch (tab) {
      case HelpTabStatus.Cheatsheet:
        return <Cheatsheet />
      case HelpTabStatus.Shortcuts:
        return <Shortcut />
      case HelpTabStatus.Links:
        return <Links />
    }
  }, [tab])

  const tabTitle = useMemo(() => t('editor.documentBar.help') + ' - ' + t(`editor.help.${tab}`), [t, tab])

  return (
    <CommonModal icon={'question-circle'} show={show} onHide={onHide} title={tabTitle}>
      <Modal.Body>
        <nav className='nav nav-tabs'>
          <Button
            variant={'light'}
            className={`nav-link nav-item ${tab === HelpTabStatus.Cheatsheet ? 'active' : ''}`}
            onClick={() => setTab(HelpTabStatus.Cheatsheet)}>
            <Trans i18nKey={'editor.help.cheatsheet.title'} />
          </Button>
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
