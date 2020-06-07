import React from 'react'
import { Dropdown } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { ForkAwesomeIcon } from '../../common/fork-awesome/fork-awesome-icon'

const EditorMenu: React.FC = () => {
  useTranslation()
  return (
    <Dropdown className="small" alignRight={true}>
      <Dropdown.Toggle variant="light" size="sm" id="editor-menu" className="text-secondary">
        <Trans i18nKey="editor.menu.menu"/>
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Header>
          <Trans i18nKey="editor.menu.extra"/>
        </Dropdown.Header>
        <Dropdown.Item className="small">
          <ForkAwesomeIcon icon="history"/> <Trans i18nKey="editor.menu.revision"/>
        </Dropdown.Item>
        <Dropdown.Item className="small">
          <ForkAwesomeIcon icon="television"/> <Trans i18nKey="editor.menu.slideMode"/>
        </Dropdown.Item>
        <Dropdown.Item className="small">
          <ForkAwesomeIcon icon="trash"/> <Trans i18nKey="editor.menu.deleteNote"/>
        </Dropdown.Item>

        <Dropdown.Divider/>

        <Dropdown.Header>
          <Trans i18nKey="common.export"/>
        </Dropdown.Header>
        <Dropdown.Item className="small">
          <ForkAwesomeIcon icon="dropbox"/> Dropbox
        </Dropdown.Item>
        <Dropdown.Item className="small">
          <ForkAwesomeIcon icon="github"/> Gist
        </Dropdown.Item>

        <Dropdown.Divider/>

        <Dropdown.Header>
          <Trans i18nKey="common.import"/>
        </Dropdown.Header>
        <Dropdown.Item className="small">
          <ForkAwesomeIcon icon="dropbox"/> Dropbox
        </Dropdown.Item>
        <Dropdown.Item className="small">
          <ForkAwesomeIcon icon="github"/> Gist
        </Dropdown.Item>
        <Dropdown.Item className="small">
          <ForkAwesomeIcon icon="clipboard"/> <Trans i18nKey="editor.import.clipboard"/>
        </Dropdown.Item>

        <Dropdown.Divider/>

        <Dropdown.Header>
          <Trans i18nKey="editor.menu.download"/>
        </Dropdown.Header>
        <Dropdown.Item className="small">
          <ForkAwesomeIcon icon="file-text"/> Markdown
        </Dropdown.Item>
        <Dropdown.Item className="small">
          <ForkAwesomeIcon icon="file-code-o"/> HTML
        </Dropdown.Item>
        <Dropdown.Item className="small">
          <ForkAwesomeIcon icon="file-code-o"/> <Trans i18nKey='editor.export.rawHtml'/>
        </Dropdown.Item>

      </Dropdown.Menu>
    </Dropdown>
  )
}

export { EditorMenu }
