/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ApiError } from '../api-error'
import type { ApiErrorResponse } from '../api-error-response'
import { ApiResponse } from '../api-response'
import { defaultConfig, defaultHeaders } from '../default-config'
import deepmerge from 'deepmerge'
import { baseUrlFromEnvExtractor } from '../../../utils/base-url-from-env-extractor'

/**
 * Builder to construct and execute a call to the HTTP API.
 *
 * @param ResponseType The type of the response if applicable.
 */
export abstract class ApiRequestBuilder<ResponseType> {
  private readonly targetUrl: string
  private customRequestOptions = defaultConfig
  private customRequestHeaders = new Headers(defaultHeaders)
  protected requestBody: BodyInit | undefined

  /**
   * Initializes a new API call with the default request options.
   *
   * @param endpoint The target endpoint without a leading slash
   * @param baseUrl An optional base URL that is used for the endpoint
   */
  constructor(endpoint: string, baseUrl?: string) {
    const actualBaseUrl = this.determineBaseUrl(baseUrl)

    this.targetUrl = `${actualBaseUrl}api/private/${endpoint}`
  }

  /**
   * Determines the API base URL by checking if the request is made on the server or client
   *
   * @return the base url
   */
  private determineBaseUrl(baseUrl?: string) {
    if (this.isSSR()) {
      const internalApiUrl = baseUrlFromEnvExtractor.extractBaseUrls().internalApiUrl
      const actualBaseUrl = internalApiUrl ?? baseUrl
      if (actualBaseUrl === undefined) {
        throw new Error("Can't make request without forced base url and without internal api url")
      }
      return actualBaseUrl
    } else {
      return baseUrl ?? '/'
    }
  }

  private isSSR() {
    return typeof window === 'undefined'
  }

  protected async sendRequestAndVerifyResponse(httpMethod: RequestInit['method']): Promise<ApiResponse<ResponseType>> {
    const response = await fetch(this.targetUrl, {
      ...this.customRequestOptions,
      method: httpMethod,
      headers: this.customRequestHeaders,
      body: this.requestBody
    })

    if (response.status >= 400) {
      const backendError = await this.readApiErrorResponseFromBody(response)
      throw new ApiError(response.status, backendError?.name, backendError?.message)
    }

    return new ApiResponse(response)
  }

  private async readApiErrorResponseFromBody(response: Response): Promise<ApiErrorResponse | undefined> {
    return response.json().catch(() => undefined) as Promise<ApiErrorResponse | undefined>
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
   * Send the prepared API call as a GET request. A default status code of 200 is expected.
   *
   * @return The API response.
   * @throws {Error} when the status code does not match the expected one or is defined as in the custom status code
   *         error mapping.
   */
  abstract sendRequest(): Promise<ApiResponse<ResponseType>>
}
