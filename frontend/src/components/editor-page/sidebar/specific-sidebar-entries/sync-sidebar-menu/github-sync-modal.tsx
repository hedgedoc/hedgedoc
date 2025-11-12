/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo, useState } from 'react'
import type { ModalVisibilityProps } from '../../../../common/modals/common-modal'
import { CommonModal } from '../../../../common/modals/common-modal'
import { Github } from 'react-bootstrap-icons'
import { Button, FormControl, FormGroup, FormLabel, FormText, Modal } from 'react-bootstrap'
import { ExternalLink } from '../../../../common/links/external-link'
import { useOnInputChange } from '../../../../../hooks/common/use-on-input-change'
import { validateToken } from '../export-sidebar-menu/entries/export-gist-sidebar-entry/validate-token'

/**
 * Placeholder modal for configuring GitHub sync.
 *
 * @param show true to show the modal, false otherwise.
 * @param onHide Callback that is fired when the modal is about to be closed.
 */
export const GithubSyncModal: React.FC<ModalVisibilityProps> = ({ show, onHide }) => {
  const [ghToken, setGhToken] = useState('')
  const onGhTokenChange = useOnInputChange(setGhToken)
  const ghTokenFormatValid = useMemo(() => validateToken(ghToken), [ghToken])

  return (
    <CommonModal show={show} onHide={onHide} showCloseButton={true} titleIcon={Github} title={'Github Sync'}>
      <Modal.Body>
        <h5 className={'mb-2'}>Authentication</h5>
        <FormGroup className={'my-2'}>
          <FormLabel>GitHub Token</FormLabel>
          <FormControl value={ghToken} onChange={onGhTokenChange} type={'password'} isInvalid={!ghTokenFormatValid} />
          <FormText muted={true}>
            Create a token:{' '}
            <ExternalLink
              text={'https://github.com/settings/personal-access-tokens/new'}
              href={'https://github.com/settings/personal-access-tokens/new'}
            />
          </FormText>
        </FormGroup>
      </Modal.Body>
      <Modal.Footer>
        <Button variant={'success'} disabled={!ghTokenFormatValid}>
          Next
        </Button>
      </Modal.Footer>
    </CommonModal>
  )
}


