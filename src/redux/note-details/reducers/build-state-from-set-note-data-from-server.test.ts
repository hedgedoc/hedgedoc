/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { NoteDto } from '../../../api/notes/types'
import { buildStateFromServerDto } from './build-state-from-set-note-data-from-server'
import * as buildStateFromUpdatedMarkdownContentModule from '../build-state-from-updated-markdown-content'
import { Mock } from 'ts-mockery'
import type { NoteDetails } from '../types/note-details'
import { NoteTextDirection, NoteType } from '../types/note-details'
import { DateTime } from 'luxon'
import { initialSlideOptions } from '../initial-state'

describe('build state from set note data from server', () => {
  const buildStateFromUpdatedMarkdownContentMock = jest.spyOn(
    buildStateFromUpdatedMarkdownContentModule,
    'buildStateFromUpdatedMarkdownContent'
  )
  const mockedNoteDetails = Mock.of<NoteDetails>()

  beforeAll(() => {
    buildStateFromUpdatedMarkdownContentMock.mockImplementation(() => mockedNoteDetails)
  })

  afterAll(() => {
    buildStateFromUpdatedMarkdownContentMock.mockReset()
  })

  it('builds a new state from the given note dto', () => {
    const noteDto: NoteDto = {
      content: 'line1\nline2',
      metadata: {
        version: 5678,
        alias: 'alias',
        id: 'id',
        createTime: '2012-05-25T09:08:34.123',
        description: 'description',
        editedBy: ['editedBy'],
        permissions: {
          owner: {
            username: 'username',
            photo: 'photo',
            email: 'email',
            displayName: 'displayName'
          },
          sharedToGroups: [
            {
              canEdit: true,
              group: {
                displayName: 'groupdisplayname',
                name: 'groupname',
                special: true
              }
            }
          ],
          sharedToUsers: [
            {
              canEdit: true,
              user: {
                username: 'shareusername',
                email: 'shareemail',
                photo: 'sharephoto',
                displayName: 'sharedisplayname'
              }
            }
          ]
        },
        viewCount: 987,
        tags: ['tag'],
        title: 'title',
        updateTime: '2020-05-25T09:08:34.123',
        updateUser: {
          username: 'updateusername',
          photo: 'updatephoto',
          email: 'updateemail',
          displayName: 'updatedisplayname'
        }
      },
      editedByAtPosition: [
        {
          endPos: 5,
          createdAt: 'createdAt',
          startPos: 9,
          updatedAt: 'updatedAt',
          userName: 'userName'
        }
      ]
    }

    const convertedNoteDetails: NoteDetails = {
      frontmatter: {
        title: '',
        description: '',
        tags: [],
        deprecatedTagsSyntax: false,
        robots: '',
        lang: 'en',
        dir: NoteTextDirection.LTR,
        newlinesAreBreaks: true,
        GA: '',
        disqus: '',
        type: NoteType.DOCUMENT,
        opengraph: {},
        slideOptions: {
          transition: 'zoom',
          autoSlide: 0,
          autoSlideStoppable: true,
          backgroundTransition: 'fade',
          slideNumber: false
        }
      },
      frontmatterRendererInfo: {
        frontmatterInvalid: false,
        deprecatedSyntax: false,
        lineOffset: 0,
        slideOptions: initialSlideOptions
      },
      noteTitle: '',
      selection: { from: { line: 0, character: 0 } },

      markdownContent: 'line1\nline2',
      markdownContentLines: ['line1', 'line2'],
      firstHeading: '',
      rawFrontmatter: '',
      id: 'id',
      createTime: DateTime.fromISO('2012-05-25T09:08:34.123'),
      lastChange: {
        username: 'updateusername',
        timestamp: DateTime.fromISO('2020-05-25T09:08:34.123')
      },
      viewCount: 987,
      alias: 'alias',
      authorship: ['editedBy']
    }

    const result = buildStateFromServerDto(noteDto)
    expect(result).toEqual(mockedNoteDetails)
    expect(buildStateFromUpdatedMarkdownContentMock).toHaveBeenCalledWith(convertedNoteDetails, 'line1\nline2')
  })
})
