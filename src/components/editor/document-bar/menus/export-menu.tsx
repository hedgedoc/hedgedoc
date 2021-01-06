/*
SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: AGPL-3.0-only
*/

import React from 'react'
import { Dropdown } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import links from '../../../../links.json'
import { ForkAwesomeIcon } from '../../../common/fork-awesome/fork-awesome-icon'
import { MarkdownExportDropdownItem } from './export/markdown'

export interface ExportMenuProps {
  title: string
}

export const ExportMenu: React.FC<ExportMenuProps> = ({ title }) => {
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
        <Dropdown.Item className='small'>
          <ForkAwesomeIcon icon='gitlab' className={'mx-2'}/>
          Gitlab Snippet
        </Dropdown.Item>

        <Dropdown.Divider/>

        <Dropdown.Header>
          <Trans i18nKey='editor.documentBar.download'/>
        </Dropdown.Header>
        <MarkdownExportDropdownItem title={title} />
        <Dropdown.Item className='small'>
          <ForkAwesomeIcon icon='file-code-o' className={'mx-2'}/>
          HTML
        </Dropdown.Item>
        <Dropdown.Item className='small'>
          <ForkAwesomeIcon icon='file-code-o' className={'mx-2'}/>
          <Trans i18nKey='editor.export.rawHtml'/>
        </Dropdown.Item>

        <Dropdown.Divider/>

        <Dropdown.Item className='small text-muted' dir={'auto'} href={links.faq} target={'_blank'} rel='noopener noreferrer'>
          <ForkAwesomeIcon icon='file-pdf-o' className={'mx-2'}/>
          <Trans i18nKey={'editor.export.pdf'}/>
          &nbsp;
          <span className={'text-primary'}>
            <Trans i18nKey={'common.why'}/>
          </span>
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  )
}
