import React from 'react'
import { Dropdown } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const EditorMenu: React.FC = () => {
  useTranslation()
  return (
    <Dropdown className="small" alignRight={true}>
      <Dropdown.Toggle variant="light" size="sm" id="editor-menu" className="text-secondary">
        <Trans i18nKey="menu"/>
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Header>
          <Trans i18nKey="extra"/>
        </Dropdown.Header>
        <Dropdown.Item className="small">
          <FontAwesomeIcon icon="history"/> <Trans i18nKey="revision"/>
        </Dropdown.Item>
        <Dropdown.Item className="small">
          <FontAwesomeIcon icon="tv"/> <Trans i18nKey="slideMode"/>
        </Dropdown.Item>

        <Dropdown.Divider/>

        <Dropdown.Header>
          <Trans i18nKey="export"/>
        </Dropdown.Header>
        <Dropdown.Item className="small">
          <FontAwesomeIcon icon={['fab', 'dropbox']}/> Dropbox
        </Dropdown.Item>
        <Dropdown.Item className="small">
          <FontAwesomeIcon icon={['fab', 'github']}/> Gist
        </Dropdown.Item>

        <Dropdown.Divider/>

        <Dropdown.Header>
          <Trans i18nKey="import"/>
        </Dropdown.Header>
        <Dropdown.Item className="small">
          <FontAwesomeIcon icon={['fab', 'dropbox']}/> Dropbox
        </Dropdown.Item>
        <Dropdown.Item className="small">
          <FontAwesomeIcon icon={['fab', 'github']}/> Gist
        </Dropdown.Item>
        <Dropdown.Item className="small">
          <FontAwesomeIcon icon="paste"/> <Trans i18nKey="clipboard"/>
        </Dropdown.Item>

        <Dropdown.Divider/>

        <Dropdown.Header>
          <Trans i18nKey="download"/>
        </Dropdown.Header>
        <Dropdown.Item className="small">
          <FontAwesomeIcon icon="file-alt"/> Markdown
        </Dropdown.Item>
        <Dropdown.Item className="small">
          <FontAwesomeIcon icon="file-code"/> HTML
        </Dropdown.Item>
        <Dropdown.Item className="small">
          <FontAwesomeIcon icon="file-code"/> Raw HTML
        </Dropdown.Item>

      </Dropdown.Menu>
    </Dropdown>
  )
}

export { EditorMenu }
