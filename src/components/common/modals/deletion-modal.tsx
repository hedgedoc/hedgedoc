import React from 'react'
import { Button, Modal } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { CommonModal, CommonModalProps } from './common-modal'

export interface DeletionModalProps extends CommonModalProps {
  onConfirm: () => void
  deletionButtonI18nKey: string
}

export const DeletionModal: React.FC<DeletionModalProps> = ({ show, onHide, titleI18nKey, onConfirm, deletionButtonI18nKey, icon, children }) => {
  useTranslation()

  return (
    <CommonModal show={show} onHide={onHide} titleI18nKey={titleI18nKey} icon={icon} closeButton={true}>
      <Modal.Body className="text-dark">
        { children }
      </Modal.Body>
      <Modal.Footer>
        <Button variant="danger" onClick={onConfirm}>
          <Trans i18nKey={deletionButtonI18nKey}/>
        </Button>
      </Modal.Footer>
    </CommonModal>
  )
}
