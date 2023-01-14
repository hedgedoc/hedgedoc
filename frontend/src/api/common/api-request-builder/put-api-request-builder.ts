/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ApiResponse } from '../api-response'
import { ApiRequestBuilderWithBody } from './api-request-builder-with-body'

/**
 * Builder to construct a PUT request to the API.
 *
 * @param ResponseType The type of the expected response.
 * @param RequestBodyType The type of the request body
 * @see ApiRequestBuilder
 */
export class PutApiRequestBuilder<ResponseType, RequestBodyType> extends ApiRequestBuilderWithBody<
  ResponseType,
  RequestBodyType
> {
  /**
   * @see ApiRequestBuilder#sendRequest
   */
  sendRequest(): Promise<ApiResponse<ResponseType>> {
    return this.sendRequestAndVerifyResponse('PUT')
  }
}
