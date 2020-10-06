import React from 'react'
import { Dropdown } from 'react-bootstrap'
import { download } from '../../../../common/download/download'
import { ForkAwesomeIcon } from '../../../../common/fork-awesome/fork-awesome-icon'

export interface MarkdownExportDropdownItemProps {
  title: string
  noteContent: string
}

export const MarkdownExportDropdownItem: React.FC<MarkdownExportDropdownItemProps> = ({ title, noteContent }) => {
  return (
    <Dropdown.Item className='small' onClick={() => download(noteContent, `${title}.md`, 'text/markdown')}>
      <ForkAwesomeIcon icon='file-text' className={'mx-2'}/>
      Markdown
    </Dropdown.Item>
  )
}
