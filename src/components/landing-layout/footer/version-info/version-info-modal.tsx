/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useMemo } from 'react'
import { CommonModal, CommonModalProps } from '../../../common/modals/common-modal'
import { Modal, Row } from 'react-bootstrap'
import { VersionInfoModalColumn } from './version-info-modal-column'
import frontendVersion from '../../../../version.json'
import links from '../../../../links.json'
import { BackendVersion } from '../../../../api/config/types'
import { useApplicationState } from '../../../../hooks/common/use-application-state'

export const VersionInfoModal: React.FC<CommonModalProps> = ({ onHide, show }) => {
  const serverVersion: BackendVersion = useApplicationState((state) => state.config.version)
  const backendVersion = useMemo(() => {
    const version = `${serverVersion.major}.${serverVersion.minor}.${serverVersion.patch}`

    if (serverVersion.preRelease) {
      return `${version}-${serverVersion.preRelease}`
    }

    if (serverVersion.commit) {
      return serverVersion.commit
    }
    return version
  }, [serverVersion])

  return (
    <CommonModal
      data-cy={'version-modal'}
      show={show}
      onHide={onHide}
      closeButton={true}
      titleI18nKey={'landing.versionInfo.title'}>
      <Modal.Body>
        <Row>
          <VersionInfoModalColumn
            titleI18nKey={'landing.versionInfo.serverVersion'}
            version={backendVersion}
            issueTrackerLink={links.backendIssues}
            sourceCodeLink={links.backendSourceCode}
          />
          <VersionInfoModalColumn
            titleI18nKey={'landing.versionInfo.clientVersion'}
            version={frontendVersion.version}
            issueTrackerLink={frontendVersion.issueTrackerUrl}
            sourceCodeLink={frontendVersion.sourceCodeUrl}
          />
        </Row>
      </Modal.Body>
    </CommonModal>
  )
}
