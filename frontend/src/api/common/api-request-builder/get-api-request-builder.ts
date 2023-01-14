/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ApiResponse } from '../api-response'
import { ApiRequestBuilder } from './api-request-builder'

/**
 * Builder to construct a GET request to the API.
 *
 * @param ResponseType The type of the expected response.
 * @see ApiRequestBuilder
 */
export class GetApiRequestBuilder<ResponseType> extends ApiRequestBuilder<ResponseType> {
  /**
   * @see ApiRequestBuilder#sendRequest
   */
  sendRequest(): Promise<ApiResponse<ResponseType>> {
    return this.sendRequestAndVerifyResponse('GET')
  }
}
