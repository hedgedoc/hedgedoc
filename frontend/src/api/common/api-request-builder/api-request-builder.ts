/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import deepmerge from 'deepmerge'
import { defaultConfig, defaultHeaders } from '../default-config'
import { ApiResponse } from '../api-response'

/**
 * Builder to construct and execute a call to the HTTP API.
 *
 * @param ResponseType The type of the response if applicable.
 */
export abstract class ApiRequestBuilder<ResponseType> {
  private readonly targetUrl: string
  private overrideExpectedResponseStatus: number | undefined
  private customRequestOptions = defaultConfig
  private customRequestHeaders = new Headers(defaultHeaders)
  private customStatusCodeErrorMapping: Record<number, string> | undefined
  protected requestBody: BodyInit | undefined

  /**
   * Initializes a new API call with the default request options.
   *
   * @param endpoint The target endpoint without a leading slash.
   */
  constructor(endpoint: string) {
    this.targetUrl = `api/private/${endpoint}`
  }

  protected async sendRequestAndVerifyResponse(
    httpMethod: RequestInit['method'],
    defaultExpectedStatus: number
  ): Promise<ApiResponse<ResponseType>> {
    const response = await fetch(this.targetUrl, {
      ...this.customRequestOptions,
      method: httpMethod,
      headers: this.customRequestHeaders,
      body: this.requestBody
    })

    if (this.customStatusCodeErrorMapping && this.customStatusCodeErrorMapping[response.status]) {
      throw new Error(this.customStatusCodeErrorMapping[response.status])
    }

    const expectedStatus = this.overrideExpectedResponseStatus
      ? this.overrideExpectedResponseStatus
      : defaultExpectedStatus
    if (response.status !== expectedStatus) {
      throw new Error(`Expected response status code ${expectedStatus} but received ${response.status}.`)
    }

    return new ApiResponse(response)
  }

  /**
   * Adds an HTTP header to the API request. Previous headers with the same name will get overridden on subsequent calls
   * with the same name.
   *
   * @param name The name of the HTTP header to add. Example: 'Content-Type'
   * @param value The value of the HTTP header to add. Example: 'text/markdown'
   * @return The API request instance itself for chaining.
   */
  withHeader(name: string, value: string): this {
    this.customRequestHeaders.set(name, value)
    return this
  }

  /**
   * Adds custom request options for the underlying fetch request by merging them with the existing options.
   *
   * @param options The options to set for the fetch request.
   * @return The API request instance itself for chaining.
   */
  withCustomOptions(options: Partial<Omit<RequestInit, 'method' | 'headers' | 'body'>>): this {
    this.customRequestOptions = deepmerge(this.customRequestOptions, options)
    return this
  }

  /**
   * Adds a mapping from response status codes to error messages. An error with the specified message will be thrown
   * when the status code of the response matches one of the defined ones.
   *
   * @param mapping The mapping from response status codes to error messages.
   * @return The API request instance itself for chaining.
   */
  withStatusCodeErrorMapping(mapping: Record<number, string>): this {
    this.customStatusCodeErrorMapping = mapping
    return this
  }

  /**
   * Sets the expected status code of the response. Can be used to override the default expected status code.
   * An error will be thrown when the status code of the response does not match the expected one.
   *
   * @param expectedCode The expected status code of the response.
   * @return The API request instance itself for chaining.
   */
  withExpectedStatusCode(expectedCode: number): this {
    this.overrideExpectedResponseStatus = expectedCode
    return this
  }

  /**
   * Send the prepared API call as a GET request. A default status code of 200 is expected.
   *
   * @return The API response.
   * @throws {Error} when the status code does not match the expected one or is defined as in the custom status code
   *         error mapping.
   */
  abstract sendRequest(): Promise<ApiResponse<ResponseType>>
}
