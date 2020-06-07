import React, { Fragment } from 'react'
import { Modal } from 'react-bootstrap'
import { Trans } from 'react-i18next'
import { ForkAwesomeIcon, IconName } from '../fork-awesome/fork-awesome-icon'

export interface ErrorModalProps {
  show: boolean
  onHide: () => void
  title: string
  icon?: IconName
}

export const ErrorModal: React.FC<ErrorModalProps> = ({ show, onHide, title, icon, children }) => {
  return (
    <Modal show={show} onHide={onHide} animation={true} className="text-dark">
      <Modal.Header closeButton>
        <Modal.Title>
          {icon
            ? <Fragment>
              <ForkAwesomeIcon icon={icon}/>&nbsp;<Trans i18nKey={title}/>
            </Fragment>
            : <Trans i18nKey={title}/>
          }

        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-dark text-center">
        {children}
      </Modal.Body>
    </Modal>
  )
}
