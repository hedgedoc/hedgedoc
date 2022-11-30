/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ApiRequestBuilder } from './api-request-builder'

/**
 * Builder to construct and execute a call to the HTTP API that contains a body payload.
 *
 * @param RequestBodyType The type of the request body if applicable.
 */
export abstract class ApiRequestBuilderWithBody<ResponseType, RequestBodyType> extends ApiRequestBuilder<ResponseType> {
  /**
   * Adds a body part to the API request. If this is called multiple times, only the body of the last invocation will be
   * used during the execution of the request.
   *
   * @param bodyData The data to use as request body.
   * @return The API request instance itself for chaining.
   */
  withBody(bodyData: BodyInit): this {
    this.requestBody = bodyData
    return this
  }

  /**
   * Adds a JSON-encoded body part to the API request. This method will set the content-type header appropriately.
   *
   * @param bodyData The data to use as request body. Will get stringified to JSON.
   * @return The API request instance itself for chaining.
   * @see withBody
   */
  withJsonBody(bodyData: RequestBodyType): this {
    this.withHeader('Content-Type', 'application/json')
    return this.withBody(JSON.stringify(bodyData))
  }
}
