import React, { Fragment, useState } from 'react'
import { Button, Modal } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { ForkAwesomeIcon } from '../../../common/fork-awesome/fork-awesome-icon'
import { Cheatsheet } from './cheatsheet'
import { Links } from './links'
import { Shortcut } from './shortcuts'

export enum HelpTabStatus {
  Cheatsheet='cheatsheet.title',
  Shortcuts='shortcuts.title',
  Links='links.title'
}

export const HelpButton: React.FC = () => {
  const { t } = useTranslation()
  const [show, setShow] = useState(false)
  const [tab, setTab] = useState<HelpTabStatus>(HelpTabStatus.Cheatsheet)

  const tabContent = (): React.ReactElement => {
    switch (tab) {
      case HelpTabStatus.Cheatsheet:
        return (<Cheatsheet/>)
      case HelpTabStatus.Shortcuts:
        return (<Shortcut/>)
      case HelpTabStatus.Links:
        return (<Links/>)
    }
  }

  return (
    <Fragment>
      <Button title={t('editor.documentBar.help')} className="ml-2 text-secondary" size="sm" variant="outline-light"
        onClick={() => setShow(true)}>
        <ForkAwesomeIcon icon="question-circle"/>
      </Button>
      <Modal show={show} onHide={() => setShow(false)} animation={true} className="text-dark" size='xl'>
        <Modal.Header closeButton>
          <Modal.Title>
            <ForkAwesomeIcon icon="question-circle"/> <Trans i18nKey={'editor.documentBar.help'}/> – <Trans i18nKey={`editor.help.${tab}`}/>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-dark">
          <ul className='nav nav-tabs'>
            <li className='nav-item'>
              <button className={`nav-link ${tab === HelpTabStatus.Cheatsheet ? 'active' : ''}`}
                onClick={() => setTab(HelpTabStatus.Cheatsheet)}
              >
                <Trans i18nKey={'editor.help.cheatsheet.title'}/>
              </button>
            </li>
            <li className='nav-item'>
              <button className={`nav-link ${tab === HelpTabStatus.Shortcuts ? 'active' : ''}`}
                onClick={() => setTab(HelpTabStatus.Shortcuts)}
              >
                <Trans i18nKey={'editor.help.shortcuts.title'}/>
              </button>
            </li>
            <li className='nav-item'>
              <button className={`nav-link ${tab === HelpTabStatus.Links ? 'active' : ''}`}
                onClick={() => setTab(HelpTabStatus.Links)}
              >
                <Trans i18nKey={'editor.help.links.title'}/>
              </button>
            </li>
          </ul>
          {tabContent()}
        </Modal.Body>
      </Modal>
    </Fragment>
  )
}
