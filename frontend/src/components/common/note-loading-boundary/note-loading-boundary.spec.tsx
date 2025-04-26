/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ApiError } from '../../../api/common/api-error'
import * as getNoteModule from '../../../api/notes'
import * as LoadingScreenModule from '../../../components/application-loader/loading-screen/loading-screen'
import * as setNoteDataFromServerModule from '../../../redux/note-details/methods'
import { mockI18n } from '../../../test-utils/mock-i18n'
import { testId } from '../../../utils/test-id'
import * as CommonErrorPageModule from '../../error-pages/common-error-page'
import * as CreateNonExistingNoteHintModule from './create-non-existing-note-hint'
import { NoteLoadingBoundary } from './note-loading-boundary'
import { render, screen } from '@testing-library/react'
import { Fragment } from 'react'
import { Mock } from 'ts-mockery'
import type { NoteDto } from '@hedgedoc/commons'
import { afterEach, beforeEach, describe, expect, it, vitest } from 'vitest'
import { vi } from 'vitest'

vi.mock('../../../hooks/common/use-single-string-url-parameter')
vi.mock('../../../api/notes')
vi.mock('../../../redux/note-details/methods')
vi.mock('../../error-pages/common-error-page', () => ({
  CommonErrorPage: vitest.fn()
}))
vi.mock('../../../components/application-loader/loading-screen/loading-screen')
vi.mock('./create-non-existing-note-hint')

describe('Note loading boundary', () => {
  const mockedNoteId = 'mockedNoteId'

  afterEach(() => {
    vitest.resetAllMocks()
    vitest.resetModules()
  })

  beforeEach(async () => {
    await mockI18n()
    vitest.spyOn(CreateNonExistingNoteHintModule, 'CreateNonExistingNoteHint').mockImplementation(() => {
      return (
        <Fragment>
          <span>This is a mock for CreateNonExistingNoteHint</span>
        </Fragment>
      )
    })
    vitest.spyOn(LoadingScreenModule, 'LoadingScreen').mockImplementation(({ errorMessage }) => {
      return (
        <Fragment>
          <span {...testId('LoadingScreen')}>This is a mock for LoadingScreen.</span>
          <span>errorMessage: {errorMessage}</span>
        </Fragment>
      )
    })
    vi
      .spyOn(CommonErrorPageModule, 'CommonErrorPage')
      .mockImplementation(({ titleI18nKey, descriptionI18nKey, children }) => {
        return (
          <Fragment>
            <span {...testId('CommonErrorPage')}>This is a mock for CommonErrorPage.</span>
            <span>titleI18nKey: {titleI18nKey}</span>
            <span>descriptionI18nKey: {descriptionI18nKey}</span>
            <span>children: {children}</span>
          </Fragment>
        )
      })
  })

  const mockGetNoteApiCall = (returnValue: NoteDto) => {
    vitest.spyOn(getNoteModule, 'getNote').mockImplementation((id) => {
      expect(id).toBe(mockedNoteId)
      return new Promise((resolve) => {
        setTimeout(() => resolve(returnValue), 0)
      })
    })
  }

  const mockCrashingNoteApiCall = () => {
    vitest.spyOn(getNoteModule, 'getNote').mockImplementation((id) => {
      expect(id).toBe(mockedNoteId)
      return new Promise((resolve, reject) => {
        setTimeout(() => reject(new ApiError(404, undefined, undefined)), 0)
      })
    })
  }

  const mockSetNoteInRedux = (expectedNote: NoteDto): vitest.SpyInstance<void, [apiResponse: NoteDto]> => {
    return vitest.spyOn(setNoteDataFromServerModule, 'setNoteDataFromServer').mockImplementation((givenNote) => {
      expect(givenNote).toBe(expectedNote)
    })
  }

  it('loads a note', async () => {
    const mockedNote: NoteDto = Mock.of<NoteDto>()
    mockGetNoteApiCall(mockedNote)
    const setNoteInReduxFunctionMock = mockSetNoteInRedux(mockedNote)

    const view = render(
      <NoteLoadingBoundary noteId={mockedNoteId}>
        <span data-testid={'success'}>success!</span>
      </NoteLoadingBoundary>
    )
    await screen.findByTestId('LoadingScreen')
    await screen.findByTestId('success')
    expect(view.container).toMatchSnapshot()
    expect(setNoteInReduxFunctionMock).toBeCalledWith(mockedNote)
  })

  it('shows an error', async () => {
    const mockedNote: NoteDto = Mock.of<NoteDto>()
    mockCrashingNoteApiCall()
    const setNoteInReduxFunctionMock = mockSetNoteInRedux(mockedNote)

    const view = render(
      <NoteLoadingBoundary noteId={mockedNoteId}>
        <span data-testid={'success'}>success!</span>
      </NoteLoadingBoundary>
    )
    await screen.findByTestId('LoadingScreen')
    await screen.findByTestId('CommonErrorPage')
    expect(view.container).toMatchSnapshot()
    expect(setNoteInReduxFunctionMock).not.toBeCalled()
  })
})
