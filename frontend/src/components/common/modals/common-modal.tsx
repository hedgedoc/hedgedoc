/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { concatCssClasses } from '../../../utils/concat-css-classes'
import type { PropsWithDataCypressId } from '../../../utils/cypress-attribute'
import { cypressId } from '../../../utils/cypress-attribute'
import { testId } from '../../../utils/test-id'
import { UiIcon } from '../icons/ui-icon'
import type { PropsWithChildren, ReactElement } from 'react'
import React, { Fragment, useMemo } from 'react'
import { Modal } from 'react-bootstrap'
import type { Icon } from 'react-bootstrap-icons'
import { Trans, useTranslation } from 'react-i18next'

export interface ModalVisibilityProps {
  show: boolean
  onHide?: () => void
}

export interface ModalContentProps {
  titleI18nKey?: string
  title?: string
  showCloseButton?: boolean
  titleIcon?: Icon
  modalSize?: 'lg' | 'sm' | 'xl'
  additionalClasses?: string
  additionalTitleElement?: ReactElement
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
 * @param additionalTitleElement additional optional element that should be shown in the header
 * @param props Additional props directly given to the modal
 */
export const CommonModal: React.FC<PropsWithChildren<CommonModalProps>> = ({
  show,
  onHide,
  titleI18nKey,
  title,
  showCloseButton,
  titleIcon,
  additionalClasses,
  modalSize,
  children,
  additionalTitleElement,
  ...props
}) => {
  useTranslation()

  const titleElement = useMemo(() => {
    return titleI18nKey !== undefined ? <Trans i18nKey={titleI18nKey} /> : <span>{title}</span>
  }, [titleI18nKey, title])

  if (!show) {
    return null
  }

  return (
    <Modal
      {...cypressId(props)}
      show={show}
      onHide={onHide}
      animation={true}
      {...testId('commonModal')}
      dialogClassName={concatCssClasses(additionalClasses)}
      size={modalSize}>
      <Modal.Header closeButton={!!showCloseButton}>
        <Modal.Title>
          <UiIcon icon={titleIcon} nbsp={true} />
          {titleElement}
        </Modal.Title>
        {additionalTitleElement ?? <Fragment />}
      </Modal.Header>
      {children}
    </Modal>
  )
}
