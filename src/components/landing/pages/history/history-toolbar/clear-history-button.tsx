import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useState, Fragment } from 'react'
import { Button, Modal } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'

export interface ClearHistoryButtonProps {
  onClearHistory: () => void
}

export const ClearHistoryButton: React.FC<ClearHistoryButtonProps> = ({ onClearHistory }) => {
  const { t } = useTranslation()
  const [show, setShow] = useState(false)

  const handleShow = () => setShow(true)
  const handleClose = () => setShow(false)

  return (
    <Fragment>
      <Button variant={'light'} title={t('clearHistory')} onClick={handleShow}>
        <FontAwesomeIcon icon={'trash'}/>
      </Button>
      <Modal show={show} onHide={handleClose} animation={true} size="sm">
        <Modal.Body className="text-dark">
          <h5><Trans i18nKey={'clearHistoryQuestion'}/></h5>
          <h6><Trans i18nKey={'clearHistoryDisclaimer'}/></h6>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            <Trans i18nKey={'close'}/>
          </Button>
          <Button variant="danger" onClick={onClearHistory}>
            <Trans i18nKey={'clearHistory'}/>
          </Button>
        </Modal.Footer>
      </Modal>
    </Fragment>
  )
}
