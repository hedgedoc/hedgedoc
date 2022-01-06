/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useMemo } from 'react'
import { Modal } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { ForkAwesomeIcon } from '../fork-awesome/fork-awesome-icon'
import type { IconName } from '../fork-awesome/types'
import { ShowIf } from '../show-if/show-if'
import type { PropsWithDataCypressId } from '../../../utils/cypress-attribute'
import { cypressId } from '../../../utils/cypress-attribute'

export interface ModalVisibilityProps {
  show: boolean
  onHide?: () => void
}

export interface ModalContentProps {
  title?: string
  titleIsI18nKey?: boolean
  showCloseButton?: boolean
  titleIcon?: IconName
  modalSize?: 'lg' | 'sm' | 'xl'
  additionalClasses?: string
}

export type CommonModalProps = PropsWithDataCypressId & ModalVisibilityProps & ModalContentProps

export const CommonModal: React.FC<CommonModalProps> = ({
  show,
  onHide,
  title,
  showCloseButton,
  titleIcon,
  additionalClasses,
  modalSize,
  children,
  titleIsI18nKey = true,
  ...props
}) => {
  useTranslation()

  const titleElement = useMemo(() => {
    return titleIsI18nKey ? <Trans i18nKey={title} /> : <span>{title}</span>
  }, [title, titleIsI18nKey])

  return (
    <ShowIf condition={show}>
      <Modal
        {...cypressId(props)}
        show={show}
        onHide={onHide}
        animation={true}
        dialogClassName={`text-dark ${additionalClasses ?? ''}`}
        size={modalSize}>
        <Modal.Header closeButton={!!showCloseButton}>
          <Modal.Title>
            <ShowIf condition={!!titleIcon}>
              <ForkAwesomeIcon icon={titleIcon as IconName} />
              &nbsp;
            </ShowIf>
            {titleElement}
          </Modal.Title>
        </Modal.Header>
        {children}
      </Modal>
    </ShowIf>
  )
}
