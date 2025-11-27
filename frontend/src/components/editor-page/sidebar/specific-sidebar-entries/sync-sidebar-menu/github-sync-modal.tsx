/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import type { ModalVisibilityProps } from '../../../../common/modals/common-modal'
import { CommonModal } from '../../../../common/modals/common-modal'
import { Github } from 'react-bootstrap-icons'
import { Button, FormControl, FormGroup, FormLabel, FormSelect, FormText, Modal, Spinner } from 'react-bootstrap'
import { ExternalLink } from '../../../../common/links/external-link'
import { useOnInputChange } from '../../../../../hooks/common/use-on-input-change'
import { validateToken } from '../export-sidebar-menu/entries/export-gist-sidebar-entry/validate-token'
import { listRepositories, type GithubRepository } from './list-repositories'
import { listBranches } from './list-branches'
import { listRepositoryPathContents, type GithubContentEntry } from './list-contents'
import { useApplicationState } from '../../../../../hooks/common/use-application-state'
// removed modal-local push/pull handling; handled by bridge + app bar quick actions

enum SyncStep {
  TOKEN = 'token',
  OWNER = 'owner',
  REPOSITORY = 'repository',
  FILE = 'file'
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
  const [branches, setBranches] = useState<string[] | null>(null)
  const [branchesLoading, setBranchesLoading] = useState(false)
  const [branchesError, setBranchesError] = useState<string | null>(null)
  const [selectedBranch, setSelectedBranch] = useState<string>('')
  const onBranchChange = useOnInputChange(setSelectedBranch)
  const [currentPath, setCurrentPath] = useState<string>('')
  const [entries, setEntries] = useState<GithubContentEntry[] | null>(null)
  const [entriesLoading, setEntriesLoading] = useState(false)
  const [entriesError, setEntriesError] = useState<string | null>(null)
  const [selectedFilePath, setSelectedFilePath] = useState<string>('')
  const onGhTokenChange = useOnInputChange(setGhToken)
  // Create specific handlers for select elements
  const onOwnerChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOwner(e.target.value)
  }, [])
  const onRepoChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRepoFullName(e.target.value)
  }, [])
  const onBranchSelectChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBranch(e.target.value)
  }, [])
  const ghTokenFormatValid = useMemo(() => validateToken(ghToken), [ghToken])
  const noteId = useApplicationState((state) => state.noteDetails?.id)
  // modal no longer performs push/pull; bridge handles actions

  // Auto-load token from localStorage or API on modal open
  useEffect(() => {
    if (!show) {
      return
    }
    
    // Try to load token from localStorage first
    try {
      const tokenRaw = window.localStorage.getItem('hd2.sync.github.token')
      if (tokenRaw) {
        const tokenData = JSON.parse(tokenRaw)
        if (tokenData.token) {
          setGhToken(tokenData.token)
          setStep(SyncStep.OWNER)
          return
        }
      }
    } catch {
      // ignore
    }

    // If not in localStorage, try to fetch from backend API
    fetch('/api/private/me/github-token', {
      credentials: 'include'
    })
      .then(response => {
        if (response.ok) {
          return response.json()
        }
        throw new Error('Failed to fetch token')
      })
      .then((data: { hasToken: boolean; token?: string }) => {
        if (data.hasToken && data.token) {
          setGhToken(data.token)
          // Skip token input step and go directly to owner selection
          setStep(SyncStep.OWNER)
        } else {
          // No token available, stay on token input step
          setStep(SyncStep.TOKEN)
        }
      })
      .catch(() => {
        // Error fetching token, stay on token input step
        setStep(SyncStep.TOKEN)
      })
  }, [show])

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
    // Save token to localStorage (user layer). This is a convenience and can be replaced later.
    try {
      window.localStorage.setItem(
        'hd2.sync.github.token',
        JSON.stringify({
          token: ghToken,
          savedAt: new Date().toISOString()
        })
      )
      window.dispatchEvent(new CustomEvent('hd2.sync.github.updated'))
    } catch {
      // ignore storage errors
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
  const parseOwnerRepo = (fullName: string): { owner: string; repo: string } => {
    const [owner, repo] = fullName.split('/')
    return { owner, repo }
  }
  const loadBranches = (owner: string, repo: string, defaultBranch?: string): void => {
    setBranchesLoading(true)
    setBranchesError(null)
    setBranches(null)
    listBranches(ghToken, owner, repo)
      .then((list) => {
        setBranches(list)
        // prefer repo default branch if available
        if (defaultBranch && list.includes(defaultBranch)) {
          setSelectedBranch(defaultBranch)
        } else if (list.length > 0) {
          setSelectedBranch(list[0])
        } else {
          setSelectedBranch('')
        }
      })
      .catch((err: unknown) => {
        setBranchesError(err instanceof Error ? err.message : 'Failed to load branches')
      })
      .finally(() => setBranchesLoading(false))
  }
  const loadEntries = (owner: string, repo: string, path: string, ref: string): void => {
    setEntriesLoading(true)
    setEntriesError(null)
    setEntries(null)
    listRepositoryPathContents(ghToken, owner, repo, path, ref)
      .then((list) => {
        setEntries(list)
      })
      .catch((err: unknown) => {
        setEntriesError(err instanceof Error ? err.message : 'Failed to load path contents')
      })
      .finally(() => setEntriesLoading(false))
  }
  const onNextFromRepo = (): void => {
    if (!selectedRepoFullName) {
      return
    }
    // find selected repo details for default branch
    const repo = repos?.find((r) => r.full_name === selectedRepoFullName)
    const { owner, repo: repoName } = parseOwnerRepo(selectedRepoFullName)
    setCurrentPath('')
    setSelectedFilePath('')
    setStep(SyncStep.FILE)
    loadBranches(owner, repoName, repo?.default_branch)
  }
  useEffect(() => {
    if (step !== SyncStep.FILE || !selectedRepoFullName || !selectedBranch) {
      return
    }
    const { owner, repo } = parseOwnerRepo(selectedRepoFullName)
    loadEntries(owner, repo, currentPath, selectedBranch)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, selectedRepoFullName, selectedBranch, currentPath, ghToken])
  const goUpOneLevel = (): void => {
    if (!currentPath) {
      return
    }
    const parts = currentPath.split('/').filter((p) => p.length > 0)
    parts.pop()
    setCurrentPath(parts.join('/'))
    setSelectedFilePath('')
  }
  const onClickEntry = (entry: GithubContentEntry): void => {
    if (entry.type === 'dir') {
      setCurrentPath(entry.path)
      setSelectedFilePath('')
      return
    }
    if (entry.type === 'file') {
      setSelectedFilePath(entry.path)
      return
    }
  }
  const onDoneSelection = (): void => {
    if (!noteId || !selectedRepoFullName || !selectedBranch || !selectedFilePath) {
      return
    }
    const { owner, repo } = parseOwnerRepo(selectedRepoFullName)
    // Save note-level sync target in localStorage for now
    try {
      const key = `hd2.sync.github.target.${noteId}`
      window.localStorage.setItem(
        key,
        JSON.stringify({
          owner,
          repo,
          branch: selectedBranch,
          path: selectedFilePath,
          savedAt: new Date().toISOString()
        })
      )
      console.log('GitHub sync target saved:', key, {
        owner,
        repo,
        branch: selectedBranch,
        path: selectedFilePath
      })
      // Dispatch multiple events to ensure components pick up the change
      window.dispatchEvent(new CustomEvent('hd2.sync.github.updated'))
      window.dispatchEvent(new StorageEvent('storage', {
        key,
        newValue: window.localStorage.getItem(key),
        url: window.location.href
      }))
    } catch (error) {
      console.error('Failed to save GitHub sync target:', error)
    }
    onHide?.()
  }

  return (
    <CommonModal show={show} onHide={onHide} showCloseButton={true} titleIcon={Github} title={'Github Sync'}>
      <Modal.Body>
        
        {step === SyncStep.TOKEN && (
          <>
            <h5 className={'mb-2'}>Authentication</h5>
            <p className={'text-muted'}>
              If you logged in via GitHub OAuth, your token should be automatically loaded. 
              Otherwise, you can provide a Personal Access Token below.
            </p>
            <FormGroup className={'my-2'}>
              <FormLabel>GitHub Token</FormLabel>
              <FormControl
                value={ghToken}
                onChange={onGhTokenChange}
                type={'password'}
                isInvalid={!ghTokenFormatValid}
                placeholder='Automatically loaded from OAuth login'
              />
              <FormText muted={true}>
                Or create a token manually:{' '}
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
            <p className={'text-muted small'}>
              ✓ Authenticated via GitHub OAuth
            </p>
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
        {step === SyncStep.FILE && (
          <>
            <h5 className={'mb-2'}>Select Branch and File</h5>
            <FormGroup className={'my-2'}>
              <FormLabel>Branch</FormLabel>
              {branchesLoading && (
                <div className={'d-flex align-items-center gap-2 my-2'}>
                  <Spinner animation='border' size='sm' /> <span>Loading branches…</span>
                </div>
              )}
              {branchesError && <div className={'text-danger my-2'}>{branchesError}</div>}
              {!branchesLoading && branches && (
                <FormSelect value={selectedBranch} onChange={onBranchSelectChange}>
                  {branches.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </FormSelect>
              )}
            </FormGroup>
            <FormGroup className={'my-2'}>
              <FormLabel>Path</FormLabel>
              <div className={'d-flex align-items-center gap-2'}>
                <code className={'flex-grow-1'}>{currentPath || '/'}</code>
                <Button size={'sm'} variant={'outline-secondary'} onClick={goUpOneLevel} disabled={!currentPath}>
                  Up
                </Button>
              </div>
              {entriesLoading && (
                <div className={'d-flex align-items-center gap-2 my-2'}>
                  <Spinner animation='border' size='sm' /> <span>Loading directory…</span>
                </div>
              )}
              {entriesError && <div className={'text-danger my-2'}>{entriesError}</div>}
              {!entriesLoading && entries && (
                <div className={'mt-2'} style={{ maxHeight: 240, overflowY: 'auto' }}>
                  {entries.length === 0 && <div className={'text-muted'}>No entries</div>}
                  {entries.map((e) => {
                    const isSelected = e.path === selectedFilePath
                    return (
                      <Button
                        key={e.path}
                        variant={isSelected ? 'success' : 'light'}
                        className={'w-100 text-start mb-1'}
                        onClick={() => onClickEntry(e)}>
                        {e.type === 'dir' ? '📁' : '📄'} {e.name}
                        {isSelected && ' (selected)'}
                      </Button>
                    )
                  })}
                </div>
              )}
            </FormGroup>
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
          <>
            <Button variant={'secondary'} onClick={onBackToOwner}>
              Back
            </Button>
            <Button variant={'success'} disabled={selectedRepoFullName.length === 0} onClick={onNextFromRepo}>
              Next
            </Button>
          </>
        )}
        {step === SyncStep.FILE && (
          <>
            <Button variant={'secondary'} onClick={() => setStep(SyncStep.REPOSITORY)}>
              Back
            </Button>
            <Button variant={'success'} disabled={selectedFilePath.length === 0} onClick={onDoneSelection}>
              Done
            </Button>
          </>
        )}
      </Modal.Footer>
    </CommonModal>
  )
}


