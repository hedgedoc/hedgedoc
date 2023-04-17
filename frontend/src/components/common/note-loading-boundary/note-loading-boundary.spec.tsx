/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ApiError } from '../../../api/common/api-error'
import * as getNoteModule from '../../../api/notes'
import type { Note } from '../../../api/notes/types'
import * as LoadingScreenModule from '../../../components/application-loader/loading-screen/loading-screen'
import * as useSingleStringUrlParameterModule from '../../../hooks/common/use-single-string-url-parameter'
import * as setNoteDataFromServerModule from '../../../redux/note-details/methods'
import { mockI18n } from '../../../test-utils/mock-i18n'
import { testId } from '../../../utils/test-id'
import * as CommonErrorPageModule from '../../error-pages/common-error-page'
import * as CreateNonExistingNoteHintModule from './create-non-existing-note-hint'
import { NoteLoadingBoundary } from './note-loading-boundary'
import { render, screen } from '@testing-library/react'
import { Fragment } from 'react'
import { Mock } from 'ts-mockery'

jest.mock('../../../hooks/common/use-single-string-url-parameter')
jest.mock('../../../api/notes')
jest.mock('../../../redux/note-details/methods')
jest.mock('../../error-pages/common-error-page', () => ({
  CommonErrorPage: jest.fn()
}))
jest.mock('../../../components/application-loader/loading-screen/loading-screen')
jest.mock('./create-non-existing-note-hint')

describe('Note loading boundary', () => {
  const mockedNoteId = 'mockedNoteId'

  afterEach(() => {
    jest.resetAllMocks()
    jest.resetModules()
  })

  beforeEach(async () => {
    await mockI18n()
    jest.spyOn(CreateNonExistingNoteHintModule, 'CreateNonExistingNoteHint').mockImplementation(() => {
      return (
        <Fragment>
          <span>This is a mock for CreateNonExistingNoteHint</span>
        </Fragment>
      )
    })
    jest.spyOn(LoadingScreenModule, 'LoadingScreen').mockImplementation(({ errorMessage }) => {
      return (
        <Fragment>
          <span {...testId('LoadingScreen')}>This is a mock for LoadingScreen.</span>
          <span>errorMessage: {errorMessage}</span>
        </Fragment>
      )
    })
    jest
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
    mockGetNoteIdQueryParameter()
  })

  const mockGetNoteIdQueryParameter = () => {
    const expectedQueryParameter = 'noteId'
    jest.spyOn(useSingleStringUrlParameterModule, 'useSingleStringUrlParameter').mockImplementation((parameter) => {
      expect(parameter).toBe(expectedQueryParameter)
      return mockedNoteId
    })
  }

  const mockGetNoteApiCall = (returnValue: Note) => {
    jest.spyOn(getNoteModule, 'getNote').mockImplementation((id) => {
      expect(id).toBe(mockedNoteId)
      return new Promise((resolve) => {
        setTimeout(() => resolve(returnValue), 0)
      })
    })
  }

  const mockCrashingNoteApiCall = () => {
    jest.spyOn(getNoteModule, 'getNote').mockImplementation((id) => {
      expect(id).toBe(mockedNoteId)
      return new Promise((resolve, reject) => {
        setTimeout(() => reject(new ApiError(404, undefined, undefined)), 0)
      })
    })
  }

  const mockSetNoteInRedux = (expectedNote: Note): jest.SpyInstance<void, [apiResponse: Note]> => {
    return jest.spyOn(setNoteDataFromServerModule, 'setNoteDataFromServer').mockImplementation((givenNote) => {
      expect(givenNote).toBe(expectedNote)
    })
  }

  it('loads a note', async () => {
    const mockedNote: Note = Mock.of<Note>()
    mockGetNoteApiCall(mockedNote)
    const setNoteInReduxFunctionMock = mockSetNoteInRedux(mockedNote)

    const view = render(
      <NoteLoadingBoundary>
        <span data-testid={'success'}>success!</span>
      </NoteLoadingBoundary>
    )
    await screen.findByTestId('LoadingScreen')
    await screen.findByTestId('success')
    expect(view.container).toMatchSnapshot()
    expect(setNoteInReduxFunctionMock).toBeCalledWith(mockedNote)
  })

  it('shows an error', async () => {
    const mockedNote: Note = Mock.of<Note>()
    mockCrashingNoteApiCall()
    const setNoteInReduxFunctionMock = mockSetNoteInRedux(mockedNote)

    const view = render(
      <NoteLoadingBoundary>
        <span data-testid={'success'}>success!</span>
      </NoteLoadingBoundary>
    )
    await screen.findByTestId('LoadingScreen')
    await screen.findByTestId('CommonErrorPage')
    expect(view.container).toMatchSnapshot()
    expect(setNoteInReduxFunctionMock).not.toBeCalled()
  })
})
