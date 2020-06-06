import React from 'react'
import { Badge } from 'react-bootstrap'
import { formatHistoryDate } from '../../../../../utils/historyUtils'
import { CloseButton } from '../common/close-button'
import { PinButton } from '../common/pin-button'
import { SyncStatus } from '../common/sync-status'
import { HistoryEntryProps } from '../history-content/history-content'

export const HistoryTableRow: React.FC<HistoryEntryProps> = ({ entry, onPinClick, onSyncClick }) => {
  return (
    <tr>
      <td>{entry.title}</td>
      <td>{formatHistoryDate(entry.lastVisited)}</td>
      <td>
        {
          entry.tags.map((tag) => <Badge variant={'light'} className={'mr-1 mb-1'}
            key={tag}>{tag}</Badge>)
        }
      </td>
      <td>
        <SyncStatus isDark={true} location={entry.location} onSync={() => onSyncClick(entry.id)} className={'mb-1 mr-1'}/>
        <PinButton isDark={true} isPinned={entry.pinned} onPinClick={() => onPinClick(entry.id)} className={'mb-1 mr-1'}/>
        <CloseButton isDark={true} className={'mb-1 mr-1'}/>
      </td>
    </tr>
  )
}
