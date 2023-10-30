/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createNoteWithPrimaryAlias } from '../../../api/notes'
import { testId } from '../../../utils/test-id'
import { UiIcon } from '../icons/ui-icon'
import React, { useCallback, useEffect } from 'react'
import { Alert, Button } from 'react-bootstrap'
import {
  ArrowRepeat as IconArrowRepeat,
  CheckCircle as IconCheckCircle,
  ExclamationTriangle as IconExclamationTriangle
} from 'react-bootstrap-icons'
import { Trans, useTranslation } from 'react-i18next'
import { useAsyncFn } from 'react-use'

export interface CreateNonExistingNoteHintProps {
  onNoteCreated: () => void
  noteId: string | undefined
}

/**
 * Shows a button that creates an empty note with the alias from the current window URL.
 * When the button was clicked it also shows the progress.
 *
 * @param onNoteCreated A function that will be called after the note was created.
 * @param noteId The wanted id for the note to create
 */
export const CreateNonExistingNoteHint: React.FC<CreateNonExistingNoteHintProps> = ({ onNoteCreated, noteId }) => {
  useTranslation()

  const [returnState, createNote] = useAsyncFn(async () => {
    if (noteId !== undefined) {
      return await createNoteWithPrimaryAlias('', noteId)
    }
  }, [noteId])

  const onClickHandler = useCallback(() => {
    void createNote()
  }, [createNote])

  useEffect(() => {
    if (returnState.value !== undefined) {
      onNoteCreated()
    }
  }, [onNoteCreated, returnState.value])

  if (noteId === undefined) {
    return null
  } else if (returnState.value) {
    return (
      <Alert variant={'info'} {...testId('noteCreated')} className={'mt-5'}>
        <UiIcon icon={IconCheckCircle} className={'me-2'} />
        <Trans i18nKey={'noteLoadingBoundary.createNote.success'} />
      </Alert>
    )
  } else if (returnState.loading) {
    return (
      <Alert variant={'info'} {...testId('loadingMessage')} className={'mt-5'}>
        <UiIcon icon={IconArrowRepeat} className={'me-2'} spin={true} />
        <Trans i18nKey={'noteLoadingBoundary.createNote.creating'} />
      </Alert>
    )
  } else if (returnState.error !== undefined) {
    return (
      <Alert variant={'danger'} {...testId('failedMessage')} className={'mt-5'}>
        <UiIcon icon={IconExclamationTriangle} className={'me-1'} />
        <Trans i18nKey={'noteLoadingBoundary.createNote.error'} />
      </Alert>
    )
  } else {
    return (
      <Alert variant={'info'} {...testId('createNoteMessage')} className={'mt-5'}>
        <span>
          <Trans i18nKey={'noteLoadingBoundary.createNote.question'} values={{ aliasName: noteId }} />
        </span>
        <div className={'mt-3'}>
          <Button
            autoFocus
            type='submit'
            variant='primary'
            className='mx-2'
            onClick={onClickHandler}
            {...testId('createNoteButton')}>
            {returnState.loading && <UiIcon icon={IconArrowRepeat} className={'me-2'} spin={true} />}
            <Trans i18nKey={'noteLoadingBoundary.createNote.create'} />
          </Button>
        </div>
      </Alert>
    )
  }
}
