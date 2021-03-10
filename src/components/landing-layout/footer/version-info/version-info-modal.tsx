/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { CommonModal, CommonModalProps } from '../../../common/modals/common-modal'
import { Modal, Row } from 'react-bootstrap'
import { VersionInfoModalColumn } from './version-info-modal-column'
import frontendVersion from '../../../../version.json'
import { useSelector } from 'react-redux'
import { ApplicationState } from '../../../../redux'
import equal from 'fast-deep-equal'

export const VersionInfoModal: React.FC<CommonModalProps> = ({ onHide, show }) => {
  const serverVersion = useSelector((state: ApplicationState) => state.config.version, equal)

  return (
    <CommonModal data-cy={ 'version-modal' } show={ show } onHide={ onHide } closeButton={ true }
                 titleI18nKey={ 'landing.versionInfo.title' }>
      <Modal.Body>
        <Row>
          <VersionInfoModalColumn
            titleI18nKey={ 'landing.versionInfo.serverVersion' }
            version={ serverVersion.version }
            issueTrackerLink={ serverVersion.issueTrackerUrl }
            sourceCodeLink={ serverVersion.sourceCodeUrl }/>
          <VersionInfoModalColumn
            titleI18nKey={ 'landing.versionInfo.clientVersion' }
            version={ frontendVersion.version }
            issueTrackerLink={ frontendVersion.issueTrackerUrl }
            sourceCodeLink={ frontendVersion.sourceCodeUrl }/>
        </Row>
      </Modal.Body>
    </CommonModal>
  )
}
