/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { PropsWithChildren } from 'react'
import React, { useMemo } from 'react'
import { Modal } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { ForkAwesomeIcon } from '../fork-awesome/fork-awesome-icon'
import type { IconName } from '../fork-awesome/types'
import { ShowIf } from '../show-if/show-if'
import type { PropsWithDataCypressId } from '../../../utils/cypress-attribute'
import { cypressId } from '../../../utils/cypress-attribute'
import { testId } from '../../../utils/test-id'

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

/**
 * Renders a generic modal.
 *
 * @param show If the modal should be shown or not.
 * @param onHide The callback to hide the modal again
 * @param title The title in the header of the modal
 * @param showCloseButton If a close button should be shown
 * @param titleIcon An optional title icon
 * @param additionalClasses Additional class names for the modal
 * @param modalSize The modal size
 * @param children The children to render into the modal.
 * @param titleIsI18nKey If the title is a i18n key and should be used as such
 * @param props Additional props directly given to the modal
 */
export const CommonModal: React.FC<PropsWithChildren<CommonModalProps>> = ({
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
        {...testId('commonModal')}
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
