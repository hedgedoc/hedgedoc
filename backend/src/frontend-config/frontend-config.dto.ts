/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { URL } from 'url';

import { GuestAccess } from '../config/guest_access.enum';
import { ProviderType } from '../identity/provider-type.enum';
import { ServerVersion } from '../monitoring/server-status.dto';
import { BaseDto } from '../utils/base.dto.';

export type AuthProviderTypeWithCustomName =
  | ProviderType.LDAP
  | ProviderType.OIDC;

export type AuthProviderTypeWithoutCustomName = ProviderType.LOCAL;

export class AuthProviderWithoutCustomNameDto extends BaseDto {
  /**
   * The type of the auth provider.
   */
  @IsString()
  @Type(() => String)
  type: AuthProviderTypeWithoutCustomName;
}

export class AuthProviderWithCustomNameDto extends BaseDto {
  /**
   * The type of the auth provider.
   */
  @IsString()
  @Type(() => String)
  type: AuthProviderTypeWithCustomName;

  /**
   * The identifier with which the auth provider can be called
   * @example gitlab-fsorg
   */
  @IsString()
  identifier: string;

  /**
   * The name given to the auth provider
   * @example GitLab fachschaften.org
   */
  @IsString()
  providerName: string;

  /**
   * The theme to apply for the login button.
   * @example gitlab
   */
  @IsOptional()
  @IsString()
  theme?: string;
}

export type AuthProviderDto =
  | AuthProviderWithCustomNameDto
  | AuthProviderWithoutCustomNameDto;

export class BrandingDto extends BaseDto {
  /**
   * The name to be displayed next to the HedgeDoc logo
   * @example ACME Corp
   */
  @IsString()
  @IsOptional()
  name?: string;

  /**
   * The logo to be displayed next to the HedgeDoc logo
   * @example https://md.example.com/logo.png
   */
  @IsUrl()
  @IsOptional()
  @Type(() => URL)
  logo?: URL;
}

export class SpecialUrlsDto extends BaseDto {
  /**
   * A link to the privacy notice
   * @example https://md.example.com/n/privacy
   */
  @IsUrl()
  @IsOptional()
  @Type(() => URL)
  privacy?: URL;

  /**
   * A link to the terms of use
   * @example https://md.example.com/n/termsOfUse
   */
  @IsUrl()
  @IsOptional()
  @Type(() => URL)
  termsOfUse?: URL;

  /**
   * A link to the imprint
   * @example https://md.example.com/n/imprint
   */
  @IsUrl()
  @IsOptional()
  @Type(() => URL)
  imprint?: URL;
}

export class FrontendConfigDto extends BaseDto {
  /**
   * Maximum access level for guest users
   */
  @IsString()
  guestAccess: GuestAccess;

  /**
   * Are users allowed to register on this instance?
   */
  @IsBoolean()
  allowRegister: boolean;

  /**
   * Are users allowed to edit their profile information?
   */
  @IsBoolean()
  allowProfileEdits: boolean;

  /**
   * Are users allowed to choose their username when signing up via OIDC?
   */
  @IsBoolean()
  allowChooseUsername: boolean;

  /**
   * Which auth providers are enabled and how are they configured?
   */
  // eslint-disable-next-line @darraghor/nestjs-typed/validated-non-primitive-property-needs-type-decorator
  @IsArray()
  @ValidateNested({ each: true })
  authProviders: AuthProviderDto[];

  /**
   * Individual branding information
   */
  @ValidateNested()
  @Type(() => BrandingDto)
  branding: BrandingDto;

  /**
   * Is an image proxy enabled?
   */
  @IsBoolean()
  useImageProxy: boolean;

  /**
   * Links to some special pages
   */
  @ValidateNested()
  @Type(() => SpecialUrlsDto)
  specialUrls: SpecialUrlsDto;

  /**
   * The version of HedgeDoc
   */
  @ValidateNested()
  @Type(() => ServerVersion)
  version: ServerVersion;

  /**
   * The plantUML server that should be used to render.
   */
  @IsUrl()
  @IsOptional()
  @Type(() => URL)
  plantUmlServer?: URL;

  /**
   * The maximal length of each document
   */
  @IsNumber()
  maxDocumentLength: number;
}
