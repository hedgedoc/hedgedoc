import React from 'react'
import { Dropdown } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

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
          <FontAwesomeIcon icon="history"/> <Trans i18nKey="editor.menu.revision"/>
        </Dropdown.Item>
        <Dropdown.Item className="small">
          <FontAwesomeIcon icon="tv"/> <Trans i18nKey="editor.menu.slideMode"/>
        </Dropdown.Item>
        <Dropdown.Item className="small">
          <FontAwesomeIcon icon="trash"/> <Trans i18nKey="editor.menu.deleteNote"/>
        </Dropdown.Item>

        <Dropdown.Divider/>

        <Dropdown.Header>
          <Trans i18nKey="common.export"/>
        </Dropdown.Header>
        <Dropdown.Item className="small">
          <FontAwesomeIcon icon={['fab', 'dropbox']}/> Dropbox
        </Dropdown.Item>
        <Dropdown.Item className="small">
          <FontAwesomeIcon icon={['fab', 'github']}/> Gist
        </Dropdown.Item>

        <Dropdown.Divider/>

        <Dropdown.Header>
          <Trans i18nKey="common.import"/>
        </Dropdown.Header>
        <Dropdown.Item className="small">
          <FontAwesomeIcon icon={['fab', 'dropbox']}/> Dropbox
        </Dropdown.Item>
        <Dropdown.Item className="small">
          <FontAwesomeIcon icon={['fab', 'github']}/> Gist
        </Dropdown.Item>
        <Dropdown.Item className="small">
          <FontAwesomeIcon icon="paste"/> <Trans i18nKey="editor.import.clipboard"/>
        </Dropdown.Item>

        <Dropdown.Divider/>

        <Dropdown.Header>
          <Trans i18nKey="editor.menu.download"/>
        </Dropdown.Header>
        <Dropdown.Item className="small">
          <FontAwesomeIcon icon="file-alt"/> Markdown
        </Dropdown.Item>
        <Dropdown.Item className="small">
          <FontAwesomeIcon icon="file-code"/> HTML
        </Dropdown.Item>
        <Dropdown.Item className="small">
          <FontAwesomeIcon icon="file-code"/> <Trans i18nKey='editor.export.rawHtml'/>
        </Dropdown.Item>

      </Dropdown.Menu>
    </Dropdown>
  )
}

export { EditorMenu }
