/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { NotePermissionsDto } from '@hedgedoc/commons'

const mockPermissionChangeApiRoutes = (permission: NotePermissionsDto) => {
  cy.intercept('PUT', 'api/private/notes/mock-note/metadata/permissions/groups/_EVERYONE', {
    statusCode: 200,
    body: permission
  })
  cy.intercept('DELETE', 'api/private/notes/mock-note/metadata/permissions/groups/_EVERYONE', {
    statusCode: 200,
    body: permission
  })
  cy.intercept('PUT', 'api/private/notes/mock-note/metadata/permissions/groups/_LOGGED_IN', {
    statusCode: 200,
    body: permission
  })
  cy.intercept('DELETE', 'api/private/notes/mock-note/metadata/permissions/groups/_LOGGED_IN', {
    statusCode: 200,
    body: permission
  })
}

describe('The permission settings modal', () => {
  beforeEach(() => {
    cy.visitTestNote()
    cy.getByCypressId('sidebar-permission-btn').click()
  })

  it('can be displayed', () => {
    cy.getByCypressId('permission-modal').should('be.visible')
    cy.getByCypressId('permission-owner-name').contains('Mock User')
    cy.getByCypressId('permission-setting-deny_LOGGED_IN').should('have.class', 'btn-secondary')
    cy.getByCypressId('permission-setting-deny_EVERYONE').should('have.class', 'btn-secondary')
  })

  it('shows alert icon on invalid settings in special groups', () => {
    cy.getByCypressId('permission-setting-deny_LOGGED_IN').should('have.class', 'btn-secondary')
    mockPermissionChangeApiRoutes({
      owner: 'mock',
      sharedToUsers: [],
      sharedToGroups: [
        {
          groupName: '_EVERYONE',
          canEdit: false
        }
      ]
    })
    cy.getByCypressId('permission-setting-read_EVERYONE').click()
    cy.get('svg.text-warning.me-2').should('be.visible')
    mockPermissionChangeApiRoutes({
      owner: 'mock',
      sharedToUsers: [],
      sharedToGroups: [
        {
          groupName: '_EVERYONE',
          canEdit: true
        }
      ]
    })
    cy.getByCypressId('permission-setting-write_EVERYONE').click()
    cy.get('svg.text-warning.me-2').should('be.visible')
    mockPermissionChangeApiRoutes({
      owner: 'mock',
      sharedToUsers: [],
      sharedToGroups: [
        {
          groupName: '_EVERYONE',
          canEdit: false
        },
        {
          groupName: '_LOGGED_IN',
          canEdit: false
        }
      ]
    })
    cy.getByCypressId('permission-setting-read_LOGGED_IN').click()
    cy.get('svg.text-warning.me-2').should('not.exist')
    mockPermissionChangeApiRoutes({
      owner: 'mock',
      sharedToUsers: [],
      sharedToGroups: [
        {
          groupName: '_EVERYONE',
          canEdit: true
        },
        {
          groupName: '_LOGGED_IN',
          canEdit: false
        }
      ]
    })
    cy.getByCypressId('permission-setting-write_EVERYONE').click()
    cy.get('svg.text-warning.me-2').should('be.visible')
    mockPermissionChangeApiRoutes({
      owner: 'mock',
      sharedToUsers: [],
      sharedToGroups: [
        {
          groupName: '_EVERYONE',
          canEdit: true
        },
        {
          groupName: '_LOGGED_IN',
          canEdit: true
        }
      ]
    })
    cy.getByCypressId('permission-setting-write_LOGGED_IN').click()
    cy.get('svg.text-warning.me-2').should('not.exist')
  })
})
