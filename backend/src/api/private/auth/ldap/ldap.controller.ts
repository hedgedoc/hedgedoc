/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  Body,
  Controller,
  InternalServerErrorException,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { IdentityService } from '../../../../auth/identity.service';
import { LdapLoginDto } from '../../../../auth/ldap/ldap-login.dto';
import { LdapService } from '../../../../auth/ldap/ldap.service';
import { ProviderType } from '../../../../auth/provider-type.enum';
import { RequestWithSession } from '../../../../auth/session.guard';
import { NotInDBError } from '../../../../errors/errors';
import { ConsoleLoggerService } from '../../../../logger/console-logger.service';
import { UsersService } from '../../../../users/users.service';
import { makeUsernameLowercase } from '../../../../utils/username';
import { OpenApi } from '../../../utils/openapi.decorator';

@ApiTags('auth')
@Controller('/auth/ldap')
export class LdapController {
  constructor(
    private readonly logger: ConsoleLoggerService,
    private usersService: UsersService,
    private ldapService: LdapService,
    private identityService: IdentityService,
  ) {
    this.logger.setContext(LdapController.name);
  }

  @Post(':ldapIdentifier/login')
  @OpenApi(200, 400, 401)
  async loginWithLdap(
    @Req()
    request: RequestWithSession,
    @Param('ldapIdentifier') ldapIdentifier: string,
    @Body() loginDto: LdapLoginDto,
  ): Promise<{ newUser: boolean }> {
    const ldapConfig = this.ldapService.getLdapConfig(ldapIdentifier);
    const userInfo = await this.ldapService.getUserInfoFromLdap(
      ldapConfig,
      loginDto.username,
      loginDto.password,
    );
    try {
      request.session.authProviderType = ProviderType.LDAP;
      request.session.authProviderIdentifier = ldapIdentifier;
      request.session.providerUserId = userInfo.id;
      await this.identityService.getIdentityFromUserIdAndProviderType(
        userInfo.id,
        ProviderType.LDAP,
        ldapIdentifier,
      );
      if (this.identityService.mayUpdateIdentity(ldapIdentifier)) {
        const user = await this.usersService.getUserByUsername(
          makeUsernameLowercase(loginDto.username),
        );
        await this.usersService.updateUser(
          user,
          userInfo.displayName,
          userInfo.email,
          userInfo.photoUrl,
        );
      }
      request.session.username = makeUsernameLowercase(loginDto.username);
      return { newUser: false };
    } catch (error) {
      if (error instanceof NotInDBError) {
        request.session.newUserData = userInfo;
        return { newUser: true };
      }
      this.logger.error(`Error during LDAP login: ${String(error)}`);
      throw new InternalServerErrorException('Error during LDAP login');
    }
  }
}
