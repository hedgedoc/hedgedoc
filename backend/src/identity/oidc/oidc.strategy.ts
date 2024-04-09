/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  BadRequestException,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Client, Issuer, TokenSet, UserinfoResponse } from 'openid-client';
import { Strategy, VerifiedCallback } from 'passport-custom';

import { AuthService } from '../../auth/auth.service';
import authConfiguration, {
  AuthConfig,
  OidcConfig,
} from '../../config/auth.config';
import { NotInDBError } from '../../errors/errors';
import { ConsoleLoggerService } from '../../logger/console-logger.service';
import { UsersService } from '../../users/users.service';
import { IdentityService } from '../identity.service';
import { ProviderType } from '../provider-type.enum';

interface OidcPathParameters {
  oidcIdentifier: string;
}

@Injectable()
export class OidcAuthGuard extends AuthGuard('oidc') {
  // noinspection JSUnusedGlobalSymbols
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const result = (await super.canActivate(context)) as boolean;
    const request = context.switchToHttp().getRequest();
    await super.logIn(request);
    return result;
  }
}

@Injectable()
export class OidcStrategy extends PassportStrategy(Strategy, 'oidc') {
  private client: Client;
  private callback: VerifiedCallback;
  constructor(
    private logger: ConsoleLoggerService,
    @Inject(authConfiguration.KEY)
    private authConfig: AuthConfig,
    private usersService: UsersService,
    private identityService: IdentityService,
  ) {
    super(
      async (
        request: Request<OidcPathParameters, unknown>,
        doneCallback: VerifiedCallback,
      ) => {
        logger.setContext(OidcStrategy.name);
        const oidcIdentifier = request.params.oidcIdentifier.toUpperCase();
        const oidcConfig = this.getOIDCConfig(oidcIdentifier);
        this.callback = doneCallback;
        /* eslint-disable @typescript-eslint/naming-convention */
        await Issuer.discover(
          `${oidcConfig.identifier}/.well-known/openid-configuration`,
        ).then((TrustIssuer) => {
          this.client = new TrustIssuer.Client({
            client_id: oidcConfig.clientID,
            client_secret: oidcConfig.clientSecret,
          });
        });
        /* eslint-enable @typescript-eslint/naming-convention */
      },
    );
  }

  private getOIDCConfig(oidcIdentifier: string): OidcConfig {
    const oidcConfig: OidcConfig | undefined = this.authConfig.oidc.find(
      (config) => config.identifier === oidcIdentifier,
    );
    if (!oidcConfig) {
      this.logger.warn(
        `The OIDC Config '${oidcIdentifier}' was requested, but doesn't exist`,
      );
      throw new BadRequestException(
        `There is no oidcConfig '${oidcIdentifier}'`,
      );
    }
    return oidcConfig;
  }

  async login(oidcConfig) {
    const callbackParams = this.client.callbackParams(
      `/oidc/${oidcConfig.identifier}/callback`,
    );
  }

  async validate(tokenset: TokenSet): Promise<any> {
    const userinfo: UserinfoResponse = await this.client.userinfo(tokenset);

    try {
      const id_token = tokenset.id_token;
      const access_token = tokenset.access_token;
      const refresh_token = tokenset.refresh_token;
      const user = {
        id_token,
        access_token,
        refresh_token,
        userinfo,
      };
      this.logger.debug(`user: ${user}`);
      return user;
    } catch (err) {
      throw new UnauthorizedException();
    }
  }

  /*
  private createOrUpdateIdentity(
    userId: string,
    ldapConfig: LDAPConfig,
    user: Record<string, string>,
    username: string, // This is not of type Username, because LDAP server may use mixed case usernames
  ): void {
    this.identityService
      .getIdentityFromUserIdAndProviderType(userId, ProviderType.OPENIDCONNECT)
      .then(async (identity) => {
        await this.updateIdentity(
          identity,
          ldapConfig.displayNameField,
          ldapConfig.profilePictureField,
          user,
        );
        return;
      })
      .catch(async (error) => {
        if (error instanceof NotInDBError) {
          // The user/identity does not yet exist
          const usernameLowercase = makeUsernameLowercase(username); // This ensures ldap user can be given permission via usernames
          const newUser = await this.usersService.createUser(
            usernameLowercase,
            // if there is no displayName we use the username
            user[ldapConfig.displayNameField] ?? username,
          );
          const identity = await this.identityService.createIdentity(
            newUser,
            ProviderType.OPENIDCONNECT,
            userId,
          );
          await this.updateIdentity(
            identity,
            ldapConfig.displayNameField,
            ldapConfig.profilePictureField,
            user,
          );
          return;
        } else {
          throw error;
        }
      });
  }

  private async updateIdentity(
    identity: Identity,
    displayNameField: string,
    profilePictureField: string,
    user: Record<string, string>,
  ): Promise<Identity> {
    let email: string | undefined = undefined;
    if (user['mail']) {
      if (Array.isArray(user['mail'])) {
        email = user['mail'][0] as string;
      } else {
        email = user['mail'];
      }
    }
    return await this.identityService.updateIdentity(
      identity,
      user[displayNameField],
      email,
      user[profilePictureField],
    );
  }*/
}
