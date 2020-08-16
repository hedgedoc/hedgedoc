import React from 'react'
import { Dropdown } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { ForkAwesomeIcon } from '../../../common/fork-awesome/fork-awesome-icon'
import { TranslatedExternalLink } from '../../../common/links/translated-external-link'

const ExportMenu: React.FC = () => {
  useTranslation()
  return (
    <Dropdown className='small mx-1' alignRight={true}>
      <Dropdown.Toggle variant='light' size='sm' id='editor-menu-export' className=''>
        <Trans i18nKey='editor.documentBar.export'/>
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Header>
          <Trans i18nKey='common.export'/>
        </Dropdown.Header>
        <Dropdown.Item className='small'>
          <ForkAwesomeIcon icon='dropbox' className={'mx-2'}/>
          Dropbox
        </Dropdown.Item>
        <Dropdown.Item className='small'>
          <ForkAwesomeIcon icon='github' className={'mx-2'}/>
          Gist
        </Dropdown.Item>

        <Dropdown.Divider/>

        <Dropdown.Header>
          <Trans i18nKey='editor.documentBar.download'/>
        </Dropdown.Header>
        <Dropdown.Item className='small'>
          <ForkAwesomeIcon icon='file-text' className={'mx-2'}/>
          Markdown
        </Dropdown.Item>
        <Dropdown.Item className='small'>
          <ForkAwesomeIcon icon='file-code-o' className={'mx-2'}/>
          HTML
        </Dropdown.Item>
        <Dropdown.Item className='small'>
          <ForkAwesomeIcon icon='file-code-o' className={'mx-2'}/>
          <Trans i18nKey='editor.export.rawHtml'/>
        </Dropdown.Item>

        <Dropdown.Divider/>

        <Dropdown.Item className='small text-muted' dir={'auto'}>
          <ForkAwesomeIcon icon='file-pdf-o' className={'mx-2'}/>
          <Trans i18nKey={'editor.export.pdf'}/>
          &nbsp;
          <TranslatedExternalLink i18nKey={'editor.export.why'} href={'https://community.codimd.org/t/frequently-asked-questions/190'} className={'text-primary'}/>
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  )
}

export { ExportMenu }
