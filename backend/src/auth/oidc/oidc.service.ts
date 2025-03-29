/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { FullUserInfoDto, ProviderType } from '@hedgedoc/commons';
import {
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Client, generators, Issuer, UserinfoResponse } from 'openid-client';

import appConfiguration, { AppConfig } from '../../config/app.config';
import authConfiguration, {
  AuthConfig,
  OidcConfig,
} from '../../config/auth.config';
import { NotInDBError } from '../../errors/errors';
import { ConsoleLoggerService } from '../../logger/console-logger.service';
import { Identity } from '../identity.entity';
import { IdentityService } from '../identity.service';
import { RequestWithSession } from '../session.guard';

interface OidcClientConfigEntry {
  client: Client;
  issuer: Issuer;
  redirectUri: string;
  config: OidcConfig;
}

@Injectable()
export class OidcService {
  private clientConfigs: Map<string, OidcClientConfigEntry> = new Map();

  constructor(
    private identityService: IdentityService,
    private logger: ConsoleLoggerService,
    @Inject(authConfiguration.KEY)
    private authConfig: AuthConfig,
    @Inject(appConfiguration.KEY)
    private appConfig: AppConfig,
  ) {
    this.updateClientConfigs();
    this.logger.setContext(OidcService.name);
    this.logger.debug('OIDC service initialized', 'constructor');
  }

  /**
   * Initializes clients for all OIDC configurations by fetching their metadata and storing them in the clientConfigs map.
   */
  private updateClientConfigs(): void {
    this.authConfig.oidc.forEach((oidcConfig) => {
      this.fetchClientConfig(oidcConfig)
        .then((config) => {
          this.clientConfigs.set(oidcConfig.identifier, config);
        })
        .catch((error) => {
          this.logger.error(
            `Failed to update OIDC client config "${oidcConfig.identifier}": ${String(error)}`,
            undefined,
            'updateClientConfigs',
          );
        });
    });
  }

  /**
   * @async
   * Fetches the client and its config (issuer, metadata) for the given OIDC configuration.
   *
   * @param {OidcConfig} oidcConfig The OIDC configuration to fetch the client config for
   * @returns {OidcClientConfigEntry} A promise that resolves to the client configuration.
   */
  private async fetchClientConfig(
    oidcConfig: OidcConfig,
  ): Promise<OidcClientConfigEntry> {
    const useAutodiscover = oidcConfig.authorizeUrl === undefined;
    const issuer = useAutodiscover
      ? await Issuer.discover(oidcConfig.issuer)
      : new Issuer({
          /* eslint-disable @typescript-eslint/naming-convention */
          issuer: oidcConfig.issuer,
          authorization_endpoint: oidcConfig.authorizeUrl,
          token_endpoint: oidcConfig.tokenUrl,
          userinfo_endpoint: oidcConfig.userinfoUrl,
          end_session_endpoint: oidcConfig.endSessionUrl,
          /* eslint-enable @typescript-eslint/naming-convention */
        });

    const redirectUri = `${this.appConfig.baseUrl}/api/private/auth/oidc/${oidcConfig.identifier}/callback`;
    const client = new issuer.Client({
      /* eslint-disable @typescript-eslint/naming-convention */
      client_id: oidcConfig.clientId,
      client_secret: oidcConfig.clientSecret,
      redirect_uris: [redirectUri],
      response_types: ['code'],
      /* eslint-enable @typescript-eslint/naming-convention */
    });
    return {
      client,
      issuer,
      redirectUri,
      config: oidcConfig,
    };
  }

  // Update all client configs every day on 3:30 AM
  @Cron('30 3 * * *')
  handleCronUpdateClientConfigs(): void {
    this.updateClientConfigs();
  }

  /**
   * Generates a secure code verifier for the OIDC login.
   *
   * @returns {string} The generated code verifier.
   */
  generateCode(): string {
    return generators.codeVerifier();
  }

  /**
   * Generates a random state for the OIDC login.
   *
   * @returns {string} The generated state.
   */
  generateState(): string {
    return generators.state();
  }

  /**
   * Generates the authorization URL for the given OIDC identifier and code.
   *
   * @param {string} oidcIdentifier The identifier of the OIDC configuration
   * @param {string} code The code verifier generated for the login
   * @param {string} state The state generated for the login
   * @returns {string} The generated authorization URL
   */
  getAuthorizationUrl(
    oidcIdentifier: string,
    code: string,
    state: string,
  ): string {
    const clientConfig = this.clientConfigs.get(oidcIdentifier);
    if (!clientConfig) {
      throw new NotFoundException(
        'OIDC configuration not found or initialized',
      );
    }
    const client = clientConfig.client;
    return client.authorizationUrl({
      scope: clientConfig.config.scope,
      /* eslint-disable @typescript-eslint/naming-convention */
      code_challenge: generators.codeChallenge(code),
      code_challenge_method: 'S256',
      state,
      /* eslint-enable @typescript-eslint/naming-convention */
    });
  }

  /**
   * @async
   * Extracts the user information from the callback and stores them in the session.
   * Afterward, the user information is returned.
   *
   * @param {string} oidcIdentifier The identifier of the OIDC configuration
   * @param {RequestWithSession} request The request containing the session
   * @returns {FullUserInfoDto} The user information extracted from the callback
   */
  async extractUserInfoFromCallback(
    oidcIdentifier: string,
    request: RequestWithSession,
  ): Promise<FullUserInfoDto> {
    const clientConfig = this.clientConfigs.get(oidcIdentifier);
    if (!clientConfig) {
      throw new NotFoundException(
        'OIDC configuration not found or initialized',
      );
    }
    const client = clientConfig.client;
    const oidcConfig = clientConfig.config;
    const params = client.callbackParams(request);
    const code = request.session.oidcLoginCode;
    const state = request.session.oidcLoginState;
    const isAutodiscovered = clientConfig.config.authorizeUrl === undefined;
    const callbackMethod = isAutodiscovered
      ? client.callback.bind(client)
      : client.oauthCallback.bind(client);
    const tokenSet = await callbackMethod(clientConfig.redirectUri, params, {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      code_verifier: code,
      state,
    });

    request.session.oidcIdToken = tokenSet.id_token;
    const userInfoResponse = await client.userinfo(tokenSet);
    const userId = OidcService.getResponseFieldValue(
      userInfoResponse,
      oidcConfig.userIdField,
      userInfoResponse.sub,
    );
    const username = OidcService.getResponseFieldValue(
      userInfoResponse,
      oidcConfig.usernameField,
      userId,
    ).toLowerCase() as Lowercase<string>;
    const displayName = OidcService.getResponseFieldValue(
      userInfoResponse,
      oidcConfig.displayNameField,
      username,
    );
    const email = OidcService.getResponseFieldValue(
      userInfoResponse,
      oidcConfig.emailField,
      undefined,
    );
    const photoUrl = OidcService.getResponseFieldValue(
      userInfoResponse,
      oidcConfig.profilePictureField,
      undefined,
    );
    const newUserData = {
      username,
      displayName,
      photoUrl: photoUrl ?? null,
      email: email ?? null,
    };
    request.session.providerUserId = userId;
    request.session.newUserData = newUserData;
    // Cleanup: The code isn't necessary anymore
    request.session.oidcLoginCode = undefined;
    request.session.oidcLoginState = undefined;
    return newUserData;
  }

  /**
   * @async
   * Checks if an identity exists for a given OIDC user and returns it if it does.
   *
   * @param {string} oidcIdentifier The identifier of the OIDC configuration
   * @param {string} oidcUserId The id of the user in the OIDC system
   * @returns {Identity} The identity if it exists
   * @returns {null} when the identity does not exist
   */
  async getExistingOidcIdentity(
    oidcIdentifier: string,
    oidcUserId: string,
  ): Promise<Identity | null> {
    const clientConfig = this.clientConfigs.get(oidcIdentifier);
    if (!clientConfig) {
      throw new NotFoundException(
        'OIDC configuration not found or initialized',
      );
    }
    try {
      return await this.identityService.getIdentityFromUserIdAndProviderType(
        oidcUserId,
        ProviderType.OIDC,
        oidcIdentifier,
      );
    } catch (e) {
      if (e instanceof NotInDBError) {
        if (!clientConfig.config.enableRegistration) {
          throw new ForbiddenException(
            'Registration is disabled for this OIDC provider',
          );
        }
        return null;
      } else {
        throw e;
      }
    }
  }

  /**
   * Returns the logout URL for the given request if the user is logged in with OIDC.
   *
   * @param {RequestWithSession} request The request containing the session
   * @returns {string} The logout URL if the user is logged in with OIDC
   * @returns {null} when there is no logout URL to redirect to
   */
  getLogoutUrl(request: RequestWithSession): string | null {
    const oidcIdentifier = request.session.authProviderIdentifier;
    if (!oidcIdentifier) {
      return null;
    }
    const clientConfig = this.clientConfigs.get(oidcIdentifier);
    if (!clientConfig) {
      throw new InternalServerErrorException(
        'OIDC configuration not found or initialized',
      );
    }
    const issuer = clientConfig.issuer;
    const endSessionEndpoint = issuer.metadata.end_session_endpoint;
    const idToken = request.session.oidcIdToken;
    if (!endSessionEndpoint) {
      return null;
    }
    return `${endSessionEndpoint}?post_logout_redirect_uri=${this.appConfig.baseUrl}${idToken ? `&id_token_hint=${idToken}` : ''}`;
  }

  /**
   * Returns a specific field from the userinfo object or a default value.
   *
   * @param {UserinfoResponse} response The response from the OIDC userinfo endpoint
   * @param {string} field The field to get from the response
   * @param {string|undefined} defaultValue The default value to return if the value is empty
   * @returns {string|undefined} The value of the field from the response or the default value
   */
  private static getResponseFieldValue<T extends string | undefined>(
    response: UserinfoResponse,
    field: string,
    defaultValue: T,
  ): string | T {
    return response[field] ? String(response[field]) : defaultValue;
  }
}
