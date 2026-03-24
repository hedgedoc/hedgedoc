/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { GetApiRequestBuilder } from '../common/api-request-builder/get-api-request-builder'
import { PostApiRequestBuilder } from '../common/api-request-builder/post-api-request-builder'
import { PutApiRequestBuilder } from '../common/api-request-builder/put-api-request-builder'
import { DeleteApiRequestBuilder } from '../common/api-request-builder/delete-api-request-builder'
import type { FolderInterface, CreateFolderInterface, UpdateFolderInterface } from '@hedgedoc/commons'

/**
 * Fetches all folders for the current user, optionally filtered by parent.
 */
export const getFolders = async (parentFolderId?: number | null): Promise<FolderInterface[]> => {
  let endpoint = 'folders'
  if (parentFolderId !== undefined) {
    endpoint += `?parentFolderId=${parentFolderId === null ? 'null' : parentFolderId}`
  }
  const response = await new GetApiRequestBuilder<FolderInterface[]>(endpoint).sendRequest()
  return response.asParsedJsonObject()
}

/**
 * Creates a new folder.
 */
export const createFolder = async (name: string, parentFolderId?: number | null): Promise<FolderInterface> => {
  const body: CreateFolderInterface = { name, parentFolderId: parentFolderId ?? null }
  const response = await new PostApiRequestBuilder<FolderInterface, CreateFolderInterface>('folders')
    .withJsonBody(body)
    .sendRequest()
  return response.asParsedJsonObject()
}

/**
 * Updates a folder.
 */
export const updateFolder = async (folderId: number, data: UpdateFolderInterface): Promise<FolderInterface> => {
  const response = await new PutApiRequestBuilder<FolderInterface, UpdateFolderInterface>(`folders/${folderId}`)
    .withJsonBody(data)
    .sendRequest()
  return response.asParsedJsonObject()
}

/**
 * Deletes a folder.
 */
export const deleteFolder = async (folderId: number): Promise<void> => {
  await new DeleteApiRequestBuilder(`folders/${folderId}`).sendRequest()
}

/**
 * Moves a note into a folder.
 */
export const moveNoteToFolder = async (noteAlias: string, folderId: number): Promise<void> => {
  await new PutApiRequestBuilder<void, { folderId: number | null }>(`folders/by-alias/${noteAlias}/move`)
    .withJsonBody({ folderId })
    .sendRequest()
}

/**
 * Removes a note from its folder (back to root).
 */
export const removeNoteFromFolder = async (noteAlias: string): Promise<void> => {
  await new PutApiRequestBuilder<void, { folderId: number | null }>(`folders/by-alias/${noteAlias}/move`)
    .withJsonBody({ folderId: null })
    .sendRequest()
}
