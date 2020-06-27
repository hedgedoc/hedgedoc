import React from 'react'
import { Modal } from 'react-bootstrap'
import { CommonModal, CommonModalProps } from './common-modal'

export const ErrorModal: React.FC<CommonModalProps> = ({ show, onHide, titleI18nKey, icon, children }) => {
  return (
    <CommonModal show={show} onHide={onHide} titleI18nKey={titleI18nKey} icon={icon} closeButton={true}>
      <Modal.Body className="text-dark text-center">
        { children }
      </Modal.Body>
    </CommonModal>
  )
}
