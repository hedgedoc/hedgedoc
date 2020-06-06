import moment from 'moment'
import React from 'react'
import { Badge, Card } from 'react-bootstrap'
import { ForkAwesomeIcon } from '../../../../../fork-awesome/fork-awesome-icon'
import { formatHistoryDate } from '../../../../../utils/historyUtils'
import { CloseButton } from '../common/close-button'
import { PinButton } from '../common/pin-button'
import { SyncStatus } from '../common/sync-status'
import { HistoryEntryProps } from '../history-content/history-content'
import './history-card.scss'

export const HistoryCard: React.FC<HistoryEntryProps> = ({ entry, onPinClick, onSyncClick }) => {
  return (
    <div className="p-2 col-xs-12 col-sm-6 col-md-6 col-lg-4">
      <Card className="card-min-height" text={'dark'} bg={'light'}>
        <Card.Body className="p-2 d-flex flex-row justify-content-between">
          <div className={'d-flex flex-column'}>
            <PinButton isDark={false} isPinned={entry.pinned} onPinClick={() => onPinClick(entry.id)}/>
            <SyncStatus isDark={false} location={entry.location} onSync={() => onSyncClick(entry.id)}
              className={'mt-1'}/>
          </div>
          <div className={'d-flex flex-column justify-content-between'}>
            <Card.Title className="m-0 mt-1dot5">{entry.title}</Card.Title>
            <div>
              <div className="text-black-50 mt-2">
                <ForkAwesomeIcon icon="clock-o"/> {moment(entry.lastVisited).fromNow()}<br/>
                {formatHistoryDate(entry.lastVisited)}
              </div>
              <div className={'card-footer-min-height p-0'}>
                {
                  entry.tags.map((tag) => <Badge variant={'dark'} className={'mr-1 mb-1'} key={tag}>{tag}</Badge>)
                }
              </div>
            </div>
          </div>
          <div className={'d-flex flex-column'}>
            <CloseButton isDark={false}/>
          </div>
        </Card.Body>
      </Card>
    </div>
  )
}
