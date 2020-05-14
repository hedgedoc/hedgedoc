import React from 'react'
import {HistoryInput} from '../history'
import {Badge, Card} from 'react-bootstrap'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {format, formatDistance} from 'date-fns'
import "../common/button.scss"
import {PinButton} from "../common/pin-button";
import {CloseButton} from "../common/close-button";

export const HistoryCard: React.FC<HistoryInput> = ({pinned, title, lastVisited, tags, onPinChange}) => {
    return (
        <div className="p-2 col-xs-12 col-sm-6 col-md-6 col-lg-4">
            <Card className="p-0" text={"dark"} bg={"light"}>
                <div className="d-flex justify-content-between p-2">
                    <PinButton pin={pinned} onPinChange={onPinChange}/>
                    <Card.Title className="m-0 mt-3">{title}</Card.Title>
                    <CloseButton/>
                </div>
                <Card.Body>
                    <div className="text-black-50">
                        <FontAwesomeIcon icon="clock"/> {formatDistance(lastVisited, new Date())}<br/>
                        {format(lastVisited, 'EEE, LLL d, YYY h:mm a')}
                        <div children=
                                 {
                                     tags.map((tag) => <Badge variant={"dark"} key={tag}>{tag}</Badge>)
                                 }
                        />
                    </div>
                </Card.Body>
            </Card>
        </div>
    )
}