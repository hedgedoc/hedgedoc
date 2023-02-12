/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { GetApiRequestBuilder } from '../common/api-request-builder/get-api-request-builder'
import type { GroupInfo } from './types'

/**
 * Retrieves information about a group with a given name.
 *
 * @param groupName The name of the group.
 * @return Information about the group.
 * @throws {Error} when the api request wasn't successful.
 */
export const getGroup = async (groupName: string): Promise<GroupInfo> => {
  const response = await new GetApiRequestBuilder<GroupInfo>('groups/' + groupName, 'group').sendRequest()
  return response.asParsedJsonObject()
}
