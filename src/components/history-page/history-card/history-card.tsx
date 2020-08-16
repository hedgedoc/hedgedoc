import moment from 'moment'
import React from 'react'
import { Badge, Card } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { formatHistoryDate } from '../utils'
import { ForkAwesomeIcon } from '../../common/fork-awesome/fork-awesome-icon'
import { EntryMenu } from '../entry-menu/entry-menu'
import { PinButton } from '../pin-button/pin-button'
import { HistoryEntryProps } from '../history-content/history-content'
import './history-card.scss'

export const HistoryCard: React.FC<HistoryEntryProps> = ({ entry, onPinClick, onRemoveClick, onDeleteClick }) => {
  return (
    <div className="p-2 col-xs-12 col-sm-6 col-md-6 col-lg-4">
      <Card className="card-min-height" text={'dark'} bg={'light'}>
        <Card.Body className="p-2 d-flex flex-row justify-content-between">
          <div className={'d-flex flex-column'}>
            <PinButton isDark={false} isPinned={entry.pinned} onPinClick={() => onPinClick(entry.id, entry.location)}/>
          </div>
          <Link to={`/n/${entry.id}`} className="text-decoration-none flex-fill text-dark">
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
          </Link>
          <div className={'d-flex flex-column'}>
            <EntryMenu
              id={entry.id}
              title={entry.title}
              location={entry.location}
              isDark={false}
              onRemove={() => onRemoveClick(entry.id, entry.location)}
              onDelete={() => onDeleteClick(entry.id, entry.location)}
            />
          </div>
        </Card.Body>
      </Card>
    </div>
  )
}
