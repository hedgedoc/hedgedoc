import React from 'react'
import { PinButton } from '../common/pin-button'
import { CloseButton } from '../common/close-button'
import { useTranslation } from 'react-i18next'
import { HistoryEntryProps } from '../history-content/history-content'
import { formatHistoryDate } from '../../../../../utils/historyUtils'
import { Badge } from 'react-bootstrap'

export const HistoryTableRow: React.FC<HistoryEntryProps> = ({ entry, onPinClick }) => {
  useTranslation()
  return (
    <tr>
      <td>{entry.title}</td>
      <td>{formatHistoryDate(entry.lastVisited)}</td>
      <td>
        {
          entry.tags.map((tag) => <Badge variant={'dark'} className={'mr-1 mb-1'}
            key={tag}>{tag}</Badge>)
        }
      </td>
      <td>
        <PinButton isDark={true} isPinned={entry.pinned} onPinClick={() => {
          onPinClick(entry.id)
        }}/>
        &nbsp;
        <CloseButton isDark={true}/>
      </td>
    </tr>
  )
}
