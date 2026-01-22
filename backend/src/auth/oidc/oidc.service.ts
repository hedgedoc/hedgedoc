/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { AuthProviderType } from '@hedgedoc/commons';
import { Identity } from '@hedgedoc/database';
import {
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Client, generators, Issuer, UserinfoResponse } from 'openid-client';

import { RequestWithSession } from '../../api/utils/request.type';
import appConfiguration, { AppConfig } from '../../config/app.config';
import authConfiguration, { AuthConfig, OidcConfig } from '../../config/auth.config';
import { PendingUserInfoDto } from '../../dtos/pending-user-info.dto';
import { NotInDBError } from '../../errors/errors';
import { ConsoleLoggerService } from '../../logger/console-logger.service';
import { IdentityService } from '../identity.service';

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
   * Fetches the client and its config (issuer, metadata) for the given OIDC configuration
   *
   * @param oidcConfig The OIDC configuration to fetch the client config for
   * @returns A promise that resolves to the client configuration.
   */
  private async fetchClientConfig(oidcConfig: OidcConfig): Promise<OidcClientConfigEntry> {
    const useAutodiscover =
      oidcConfig.authorizeUrl === undefined ||
      oidcConfig.tokenUrl === undefined ||
      oidcConfig.userinfoUrl === undefined;
    const issuer = useAutodiscover
      ? await Issuer.discover(oidcConfig.issuer)
      : new Issuer({
          /* oxlint-disable @typescript-eslint/naming-convention */
          issuer: oidcConfig.issuer,
          authorization_endpoint: oidcConfig.authorizeUrl,
          token_endpoint: oidcConfig.tokenUrl,
          userinfo_endpoint: oidcConfig.userinfoUrl,
          end_session_endpoint: oidcConfig.endSessionUrl,
          /* oxlint-enable @typescript-eslint/naming-convention */
        });

    const redirectUri = `${this.appConfig.baseUrl}/api/private/auth/oidc/${oidcConfig.identifier}/callback`;
    const client = new issuer.Client({
      /* oxlint-disable @typescript-eslint/naming-convention */
      client_id: oidcConfig.clientId,
      client_secret: oidcConfig.clientSecret,
      redirect_uris: [redirectUri],
      response_types: ['code'],
      /* oxlint-enable @typescript-eslint/naming-convention */
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
   * @returns The generated code verifier.
   */
  generateCode(): string {
    return generators.codeVerifier();
  }

  /**
   * Generates a random state for the OIDC login.
   *
   * @returns The generated state.
   */
  generateState(): string {
    return generators.state();
  }

  /**
   * Generates the authorization URL for the given OIDC identifier and code.
   *
   * @param oidcIdentifier The identifier of the OIDC configuration
   * @param code The code verifier generated for the login
   * @param state The state generated for the login
   * @returns The generated authorization URL
   */
  getAuthorizationUrl(oidcIdentifier: string, code: string, state: string): string {
    const clientConfig = this.clientConfigs.get(oidcIdentifier);
    if (!clientConfig) {
      throw new NotFoundException('OIDC configuration not found or initialized');
    }
    const client = clientConfig.client;
    return client.authorizationUrl({
      scope: clientConfig.config.scope,
      /* oxlint-disable @typescript-eslint/naming-convention */
      code_challenge: generators.codeChallenge(code),
      code_challenge_method: 'S256',
      state,
      /* oxlint-enable @typescript-eslint/naming-convention */
    });
  }

  /**
   * Extracts the user information from the callback and stores them in the session.
   * Afterward, the user information is returned.
   *
   * @param oidcIdentifier The identifier of the OIDC configuration
   * @param request The request containing the session
   * @returns The user information extracted from the callback
   */
  async extractUserInfoFromCallback(
    oidcIdentifier: string,
    request: RequestWithSession,
  ): Promise<PendingUserInfoDto> {
    const clientConfig = this.clientConfigs.get(oidcIdentifier);
    if (!clientConfig) {
      throw new NotFoundException('OIDC configuration not found or initialized');
    }
    const client = clientConfig.client;
    const oidcConfig = clientConfig.config;
    const params = client.callbackParams(request.raw);
    const code = request.session.oidc?.loginCode;
    const state = request.session.oidc?.loginState;
    const isAutodiscovered = clientConfig.config.authorizeUrl === undefined;
    const callbackMethod = isAutodiscovered
      ? client.callback.bind(client)
      : client.oauthCallback.bind(client);
    const tokenSet = await callbackMethod(clientConfig.redirectUri, params, {
      // oxlint-disable-next-line @typescript-eslint/naming-convention
      code_verifier: code,
      state,
    });

    request.session.oidc = {
      idToken: tokenSet.id_token,
    };
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
    request.session.pendingUser = {
      authProviderType: AuthProviderType.OIDC,
      authProviderIdentifier: oidcIdentifier,
      providerUserId: userId,
      confirmationData: newUserData,
    };
    return PendingUserInfoDto.create(newUserData);
  }

  /**
   * Checks if an identity exists for a given OIDC user and returns it if it does
   *
   * @param oidcIdentifier The identifier of the OIDC configuration
   * @param oidcUserId The id of the user in the OIDC system
   * @returns The identity if it exists, null otherwise
   */
  async getExistingOidcIdentity(
    oidcIdentifier: string,
    oidcUserId: string,
  ): Promise<Identity | null> {
    const clientConfig = this.clientConfigs.get(oidcIdentifier);
    if (!clientConfig) {
      throw new NotFoundException('OIDC configuration not found or initialized');
    }
    try {
      return await this.identityService.getIdentityFromUserIdAndProviderType(
        oidcUserId,
        AuthProviderType.OIDC,
        oidcIdentifier,
      );
    } catch (e) {
      // Catch not-found errors when registration via OIDC is enabled and return null instead
      if (e instanceof NotInDBError) {
        if (!clientConfig.config.enableRegistration) {
          throw new ForbiddenException('Registration is disabled for this OIDC provider');
        }
        return null;
      } else {
        throw e;
      }
    }
  }

  /**
   * Returns the logout URL for the given request if the user is logged in with OIDC
   *
   * @param request The request containing the session
   * @returns The logout URL if the user is logged in with OIDC, or null if there is no URL to redirect to
   */
  getLogoutUrl(request: RequestWithSession): string | null {
    const oidcIdentifier = request.session.authProviderIdentifier;
    if (!oidcIdentifier) {
      return null;
    }
    const clientConfig = this.clientConfigs.get(oidcIdentifier);
    if (!clientConfig) {
      throw new InternalServerErrorException('OIDC configuration not found or initialized');
    }
    const issuer = clientConfig.issuer;
    const endSessionEndpoint = issuer.metadata.end_session_endpoint;
    const idToken = request.session.oidc?.idToken;
    if (!endSessionEndpoint) {
      return null;
    }
    return `${endSessionEndpoint}?post_logout_redirect_uri=${this.appConfig.baseUrl}${idToken ? `&id_token_hint=${idToken}` : ''}`;
  }

  /**
   * Returns a specific field from the userinfo object or a default value
   *
   * @param response The response from the OIDC userinfo endpoint
   * @param field The field to get from the response
   * @param defaultValue The default value to return if the value is empty
   * @returns The value of the field from the response or the default value
   */
  private static getResponseFieldValue<T extends string | undefined>(
    response: UserinfoResponse,
    field: string,
    defaultValue: T,
  ): string | T {
    return response[field] ? String(response[field]) : defaultValue;
  }
}
