/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useEffect, useMemo, useState } from 'react'
import type { ModalVisibilityProps } from '../../../../common/modals/common-modal'
import { CommonModal } from '../../../../common/modals/common-modal'
import { Github } from 'react-bootstrap-icons'
import { Button, FormControl, FormGroup, FormLabel, FormSelect, FormText, Modal, Spinner } from 'react-bootstrap'
import { ExternalLink } from '../../../../common/links/external-link'
import { useOnInputChange } from '../../../../../hooks/common/use-on-input-change'
import { validateToken } from '../export-sidebar-menu/entries/export-gist-sidebar-entry/validate-token'
import { listRepositories, type GithubRepository } from './list-repositories'

enum SyncStep {
  TOKEN = 'token',
  OWNER = 'owner',
  REPOSITORY = 'repository'
}

/**
 * Placeholder modal for configuring GitHub sync.
 *
 * @param show true to show the modal, false otherwise.
 * @param onHide Callback that is fired when the modal is about to be closed.
 */
export const GithubSyncModal: React.FC<ModalVisibilityProps> = ({ show, onHide }) => {
  const [ghToken, setGhToken] = useState('')
  const [step, setStep] = useState<SyncStep>(SyncStep.TOKEN)
  const [repos, setRepos] = useState<GithubRepository[] | null>(null)
  const [isLoadingRepos, setIsLoadingRepos] = useState(false)
  const [reposError, setReposError] = useState<string | null>(null)
  const [selectedOwner, setSelectedOwner] = useState<string>('')
  const [selectedRepoFullName, setSelectedRepoFullName] = useState<string>('')
  const onGhTokenChange = useOnInputChange(setGhToken)
  const onOwnerChange = useOnInputChange(setSelectedOwner)
  const onRepoChange = useOnInputChange(setSelectedRepoFullName)
  const ghTokenFormatValid = useMemo(() => validateToken(ghToken), [ghToken])

  useEffect(() => {
    if (step !== SyncStep.OWNER && step !== SyncStep.REPOSITORY) {
      return
    }
    setIsLoadingRepos(true)
    setReposError(null)
    setRepos(null)
    listRepositories(ghToken)
      .then((list) => {
        setRepos(list)
      })
      .catch((err: unknown) => {
        setReposError(err instanceof Error ? err.message : 'Failed to load repositories')
      })
      .finally(() => setIsLoadingRepos(false))
  }, [ghToken, step])

  const onNextFromToken = (): void => {
    if (!ghTokenFormatValid) {
      return
    }
    setStep(SyncStep.OWNER)
  }

  const onBackToToken = (): void => {
    setStep(SyncStep.TOKEN)
  }
  const onNextFromOwner = (): void => {
    if (!selectedOwner) {
      return
    }
    setStep(SyncStep.REPOSITORY)
    setSelectedRepoFullName('')
  }
  const onBackToOwner = (): void => {
    setStep(SyncStep.OWNER)
  }

  return (
    <CommonModal show={show} onHide={onHide} showCloseButton={true} titleIcon={Github} title={'Github Sync'}>
      <Modal.Body>
        {step === SyncStep.TOKEN && (
          <>
            <h5 className={'mb-2'}>Authentication</h5>
            <FormGroup className={'my-2'}>
              <FormLabel>GitHub Token</FormLabel>
              <FormControl
                value={ghToken}
                onChange={onGhTokenChange}
                type={'password'}
                isInvalid={!ghTokenFormatValid}
              />
              <FormText muted={true}>
                Create a token:{' '}
                <ExternalLink
                  text={'https://github.com/settings/personal-access-tokens/new'}
                  href={'https://github.com/settings/personal-access-tokens/new'}
                />
              </FormText>
            </FormGroup>
          </>
        )}
        {step === SyncStep.OWNER && (
          <>
            <h5 className={'mb-2'}>Select Organization</h5>
            {isLoadingRepos && (
              <div className={'d-flex align-items-center gap-2 my-2'}>
                <Spinner animation='border' size='sm' /> <span>Loading organizations…</span>
              </div>
            )}
            {reposError && <div className={'text-danger my-2'}>{reposError}</div>}
            {!isLoadingRepos && repos && (
              <FormGroup className={'my-2'}>
                <FormLabel>Owner / Organization</FormLabel>
                <FormSelect value={selectedOwner} onChange={onOwnerChange}>
                  <option value='' disabled={true}>
                    Select an owner…
                  </option>
                  {Array.from(new Set(repos.map((r) => r.owner.login)))
                    .sort((a, b) => a.localeCompare(b))
                    .map((owner) => (
                      <option key={owner} value={owner}>
                        {owner}
                      </option>
                    ))}
                </FormSelect>
              </FormGroup>
            )}
          </>
        )}
        {step === SyncStep.REPOSITORY && (
          <>
            <h5 className={'mb-2'}>Select Repository</h5>
            {isLoadingRepos && (
              <div className={'d-flex align-items-center gap-2 my-2'}>
                <Spinner animation='border' size='sm' /> <span>Loading repositories…</span>
              </div>
            )}
            {reposError && <div className={'text-danger my-2'}>{reposError}</div>}
            {!isLoadingRepos && repos && (
              <FormGroup className={'my-2'}>
                <FormLabel>Repository</FormLabel>
                <FormSelect value={selectedRepoFullName} onChange={onRepoChange}>
                  <option value='' disabled={true}>
                    Select a repository…
                  </option>
                  {repos
                    .filter((repo) => repo.owner.login === selectedOwner)
                    .map((repo) => (
                      <option key={repo.id} value={repo.full_name}>
                        {repo.full_name} {repo.private ? '(private)' : ''}
                      </option>
                    ))}
                </FormSelect>
              </FormGroup>
            )}
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        {step === SyncStep.REPOSITORY && (
          <Button variant={'secondary'} onClick={onBackToToken}>
            Back
          </Button>
        )}
        {step === SyncStep.TOKEN && (
          <Button variant={'success'} disabled={!ghTokenFormatValid} onClick={onNextFromToken}>
            Next
          </Button>
        )}
        {step === SyncStep.OWNER && (
          <>
            <Button variant={'secondary'} onClick={onBackToToken}>
              Back
            </Button>
            <Button variant={'success'} disabled={selectedOwner.length === 0} onClick={onNextFromOwner}>
              Next
            </Button>
          </>
        )}
        {step === SyncStep.REPOSITORY && (
          <Button variant={'success'} disabled={selectedRepoFullName.length === 0}>
            Next
          </Button>
        )}
      </Modal.Footer>
    </CommonModal>
  )
}


