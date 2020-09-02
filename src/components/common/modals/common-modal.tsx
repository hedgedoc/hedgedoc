import React from 'react'
import { Modal } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { ForkAwesomeIcon } from '../fork-awesome/fork-awesome-icon'
import { IconName } from '../fork-awesome/types'
import { ShowIf } from '../show-if/show-if'

export interface CommonModalProps {
  show: boolean
  onHide: () => void
  titleI18nKey: string
  closeButton?: boolean
  icon?: IconName
  size?: 'lg' | 'sm' | 'xl'
  additionalClasses?: string
}

export const CommonModal: React.FC<CommonModalProps> = ({ show, onHide, titleI18nKey, closeButton, icon, additionalClasses, size, children }) => {
  useTranslation()

  return (
    <Modal show={show} onHide={onHide} animation={true} dialogClassName={`text-dark ${additionalClasses ?? ''}`} size={size}>
      <Modal.Header closeButton={!!closeButton}>
        <Modal.Title>
          <ShowIf condition={!!icon}>
            <ForkAwesomeIcon icon={icon as IconName}/>&nbsp;
          </ShowIf>
          <Trans i18nKey={titleI18nKey}/>
        </Modal.Title>
      </Modal.Header>
      { children }
    </Modal>
  )
}
