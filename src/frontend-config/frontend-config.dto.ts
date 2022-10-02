/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
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
import { ServerVersion } from '../monitoring/server-status.dto';
import { BaseDto } from '../utils/base.dto.';

export enum AuthProviderType {
  LOCAL = 'local',
  LDAP = 'ldap',
  SAML = 'saml',
  OAUTH2 = 'oauth2',
  GITLAB = 'gitlab',
  FACEBOOK = 'facebook',
  GITHUB = 'github',
  TWITTER = 'twitter',
  DROPBOX = 'dropbox',
  GOOGLE = 'google',
}

export type AuthProviderTypeWithCustomName =
  | AuthProviderType.LDAP
  | AuthProviderType.OAUTH2
  | AuthProviderType.SAML
  | AuthProviderType.GITLAB;

export type AuthProviderTypeWithoutCustomName =
  | AuthProviderType.LOCAL
  | AuthProviderType.FACEBOOK
  | AuthProviderType.GITHUB
  | AuthProviderType.TWITTER
  | AuthProviderType.DROPBOX
  | AuthProviderType.GOOGLE;

export class AuthProviderWithoutCustomNameDto extends BaseDto {
  /**
   * The type of the auth provider.
   */
  @IsString()
  type: AuthProviderTypeWithoutCustomName;
}

export class AuthProviderWithCustomNameDto extends BaseDto {
  /**
   * The type of the auth provider.
   */
  @IsString()
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
  logo?: URL;
}

export class SpecialUrlsDto extends BaseDto {
  /**
   * A link to the privacy notice
   * @example https://md.example.com/n/privacy
   */
  @IsUrl()
  @IsOptional()
  privacy?: URL;

  /**
   * A link to the terms of use
   * @example https://md.example.com/n/termsOfUse
   */
  @IsUrl()
  @IsOptional()
  termsOfUse?: URL;

  /**
   * A link to the imprint
   * @example https://md.example.com/n/imprint
   */
  @IsUrl()
  @IsOptional()
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
   * Which auth providers are enabled and how are they configured?
   */
  @IsArray()
  @ValidateNested({ each: true })
  authProviders: AuthProviderDto[];

  /**
   * Individual branding information
   */
  @ValidateNested()
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
  specialUrls: SpecialUrlsDto;

  /**
   * The version of HedgeDoc
   */
  @ValidateNested()
  version: ServerVersion;

  /**
   * The plantUML server that should be used to render.
   */
  @IsUrl()
  @IsOptional()
  plantUmlServer?: URL;

  /**
   * The maximal length of each document
   */
  @IsNumber()
  maxDocumentLength: number;
}
