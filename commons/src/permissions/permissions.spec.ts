/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { userCanEdit, userIsOwner } from './permissions.js'
import { describe, expect, it } from '@jest/globals'
import { NotePermissionsDto, SpecialGroup } from '../dtos/index.js'

describe('Permissions', () => {
  const testPermissions: NotePermissionsDto = {
    owner: 'owner',
    sharedToUsers: [
      {
        username: 'logged_in',
        canEdit: true,
      },
    ],
    sharedToGroups: [
      {
        groupName: SpecialGroup.EVERYONE,
        canEdit: true,
      },
      {
        groupName: SpecialGroup.LOGGED_IN,
        canEdit: true,
      },
    ],
  }
  describe('userIsOwner', () => {
    it('returns true, if user is owner', () => {
      expect(userIsOwner(testPermissions, 'owner')).toBeTruthy()
    })
    it('returns false, if user is not ownerr', () => {
      expect(userIsOwner(testPermissions, 'not_owner')).toBeFalsy()
    })
    it('returns false, if user is undefined', () => {
      expect(userIsOwner(testPermissions, undefined)).toBeFalsy()
    })
  })

  describe('userCanEdit', () => {
    it('returns true, if user is owner', () => {
      expect(userCanEdit(testPermissions, 'owner')).toBeTruthy()
    })
    it('returns true, if user is logged in and this is user specifically may edit', () => {
      expect(
        userCanEdit({ ...testPermissions, sharedToGroups: [] }, 'logged_in'),
      ).toBeTruthy()
    })
    it('returns true, if user is logged in and loggedIn users may edit', () => {
      expect(
        userCanEdit({ ...testPermissions, sharedToUsers: [] }, 'logged_in'),
      ).toBeTruthy()
    })
    it('returns true, if user is guest and guests are allowed to edit', () => {
      expect(
        userCanEdit({ ...testPermissions, sharedToUsers: [] }, undefined),
      ).toBeTruthy()
    })
    it('returns false, if user is logged in and loggedIn users may not edit', () => {
      expect(
        userCanEdit(
          { ...testPermissions, sharedToUsers: [], sharedToGroups: [] },
          'logged_in',
        ),
      ).toBeFalsy()
    })
    it('returns false, if user is guest and guests are not allowed to edit', () => {
      expect(
        userCanEdit(
          {
            ...testPermissions,
            sharedToUsers: [],
            sharedToGroups: [
              {
                groupName: SpecialGroup.LOGGED_IN,
                canEdit: true,
              },
            ],
          },
          undefined,
        ),
      ).toBeFalsy()
    })
  })
})
