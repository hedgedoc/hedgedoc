/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { AuthProviderType } from '@hedgedoc/commons';
import { FieldNameIdentity } from '@hedgedoc/database';
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
import { LdapService } from '../../../../auth/ldap/ldap.service';
import { LdapLoginResponseDto } from '../../../../dtos/ldap-login-response.dto';
import { LdapLoginDto } from '../../../../dtos/ldap-login.dto';
import { NotInDBError } from '../../../../errors/errors';
import { ConsoleLoggerService } from '../../../../logger/console-logger.service';
import { UsersService } from '../../../../users/users.service';
import { OpenApi } from '../../../utils/decorators/openapi.decorator';
import { RequestWithSession } from '../../../utils/request.type';

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
  ): Promise<LdapLoginResponseDto> {
    const ldapConfig = this.ldapService.getLdapConfig(ldapIdentifier);
    const userInfo = await this.ldapService.getUserInfoFromLdap(
      ldapConfig,
      loginDto.username,
      loginDto.password,
    );
    try {
      const identity =
        await this.identityService.getIdentityFromUserIdAndProviderType(
          userInfo.id,
          AuthProviderType.LDAP,
          ldapIdentifier,
        );
      if (this.identityService.mayUpdateIdentity(ldapIdentifier)) {
        await this.usersService.updateUser(
          identity[FieldNameIdentity.userId],
          userInfo.displayName,
          userInfo.email,
          userInfo.photoUrl,
        );
      }
      request.session.authProviderType = AuthProviderType.LDAP;
      request.session.authProviderIdentifier = ldapIdentifier;
      request.session.userId = identity[FieldNameIdentity.userId];
      return LdapLoginResponseDto.create({ newUser: false });
    } catch (error) {
      if (error instanceof NotInDBError) {
        request.session.pendingUser = {
          authProviderType: AuthProviderType.LDAP,
          authProviderIdentifier: ldapIdentifier,
          confirmationData: userInfo,
          providerUserId: userInfo.id,
        };
        return LdapLoginResponseDto.create({ newUser: true });
      }
      this.logger.error(`Error during LDAP login: ${String(error)}`);
      throw new InternalServerErrorException('Error during LDAP login');
    }
  }
}
