/*
SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: AGPL-3.0-only
*/

import React from 'react'
import { Dropdown } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { ApplicationState } from '../../../../../redux'
import { download } from '../../../../common/download/download'
import { ForkAwesomeIcon } from '../../../../common/fork-awesome/fork-awesome-icon'

export interface MarkdownExportDropdownItemProps {
  title: string
}

export const MarkdownExportDropdownItem: React.FC<MarkdownExportDropdownItemProps> = ({ title }) => {
  const markdownContent = useSelector((state: ApplicationState) => state.documentContent.content)

  return (
    <Dropdown.Item className='small' onClick={() => download(markdownContent, `${title}.md`, 'text/markdown')}>
      <ForkAwesomeIcon icon='file-text' className={'mx-2'}/>
      Markdown
    </Dropdown.Item>
  )
}
