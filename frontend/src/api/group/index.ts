/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { GetApiRequestBuilder } from '../common/api-request-builder/get-api-request-builder'
import type { GroupInfoDto } from '@hedgedoc/commons'

/**
 * Retrieves information about a group with a given name.
 *
 * @param groupName The name of the group.
 * @return Information about the group.
 * @throws {Error} when the api request wasn't successful.
 */
export const getGroup = async (groupName: string): Promise<GroupInfoDto> => {
  const response = await new GetApiRequestBuilder<GroupInfoDto>('groups/' + groupName).sendRequest()
  return response.asParsedJsonObject()
}
