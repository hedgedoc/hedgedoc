/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 * Class that represents the response of an {@link ApiRequestBuilder}.
 */
export class ApiResponse<ResponseType> {
  private readonly response: Response

  /**
   * Initializes a new API response instance based on an HTTP response.
   *
   * @param response The HTTP response from the fetch call.
   */
  constructor(response: Response) {
    this.response = response
  }

  /**
   * Returns the raw response from the fetch call.
   *
   * @return The response from the fetch call.
   */
  getResponse(): Response {
    return this.response
  }

  static isSuccessfulResponse(response: Response): boolean {
    return response.status >= 400
  }

  isSuccessful(): boolean {
    return ApiResponse.isSuccessfulResponse(this.response)
  }

  /**
   * Returns the response as parsed JSON. An error will be thrown if the response is not JSON encoded.
   *
   * @return The parsed JSON response.
   * @throws {Error} if the response is not JSON encoded.
   */
  async asParsedJsonObject(): Promise<ResponseType> {
    if (!this.response.headers.get('Content-Type')?.startsWith('application/json')) {
      throw new Error('Response body does not seem to be JSON encoded.')
    }
    // TODO Responses should better be type validated
    //  see https://github.com/hedgedoc/hedgedoc/issues/2910
    return (await this.response.json()) as ResponseType
  }
}
