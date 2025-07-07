/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  AuthProviderDto,
  AuthProviderType,
  BrandingDto,
  FrontendConfigDto,
  SpecialUrlDto,
} from '@hedgedoc/commons';
import { Inject, Injectable } from '@nestjs/common';
import { URL } from 'url';

import authConfiguration, { AuthConfig } from '../config/auth.config';
import customizationConfiguration, {
  CustomizationConfig,
} from '../config/customization.config';
import externalServicesConfiguration, {
  ExternalServicesConfig,
} from '../config/external-services.config';
import noteConfiguration, { NoteConfig } from '../config/note.config';
import { ConsoleLoggerService } from '../logger/console-logger.service';
import { getServerVersionFromPackageJson } from '../utils/server-version';

@Injectable()
export class FrontendConfigService {
  constructor(
    private readonly logger: ConsoleLoggerService,
    @Inject(noteConfiguration.KEY)
    private noteConfig: NoteConfig,
    @Inject(authConfiguration.KEY)
    private authConfig: AuthConfig,
    @Inject(customizationConfiguration.KEY)
    private customizationConfig: CustomizationConfig,
    @Inject(externalServicesConfiguration.KEY)
    private externalServicesConfig: ExternalServicesConfig,
  ) {
    this.logger.setContext(FrontendConfigService.name);
  }

  /**
   * Returns the config options for the frontend
   *
   * @returns A frontend config DTO
   */
  async getFrontendConfig(): Promise<FrontendConfigDto> {
    return {
      guestAccess: this.noteConfig.permissions.maxGuestLevel,
      allowRegister: this.authConfig.local.enableRegister,
      allowProfileEdits: this.authConfig.common.allowProfileEdits,
      allowChooseUsername: this.authConfig.common.allowChooseUsername,
      authProviders: this.getAuthProviders(),
      branding: this.getBranding(),
      maxDocumentLength: this.noteConfig.maxDocumentLength,
      plantUmlServer: this.externalServicesConfig.plantumlServer
        ? new URL(this.externalServicesConfig.plantumlServer).toString()
        : null,
      specialUrls: this.getSpecialUrls(),
      useImageProxy: !!this.externalServicesConfig.imageProxy,
      version: await getServerVersionFromPackageJson(),
    };
  }

  /**
   * Reads the auth providers from the config and returns them
   *
   * @returns An array of auth provider DTOs
   */
  private getAuthProviders(): AuthProviderDto[] {
    const providers: AuthProviderDto[] = [];
    if (this.authConfig.local.enableLogin) {
      providers.push({
        type: AuthProviderType.LOCAL,
      });
    }
    this.authConfig.ldap.forEach((ldapEntry) => {
      providers.push({
        type: AuthProviderType.LDAP,
        providerName: ldapEntry.providerName,
        identifier: ldapEntry.identifier,
        theme: null,
      });
    });
    this.authConfig.oidc.forEach((openidConnectEntry) => {
      providers.push({
        type: AuthProviderType.OIDC,
        providerName: openidConnectEntry.providerName,
        identifier: openidConnectEntry.identifier,
        theme: openidConnectEntry.theme ?? null,
      });
    });
    return providers;
  }

  /**
   * Reads the branding from the config and returns it
   *
   * @returns A branding DTO
   */
  private getBranding(): BrandingDto {
    return {
      logo: this.customizationConfig.branding.customLogo
        ? new URL(this.customizationConfig.branding.customLogo).toString()
        : null,
      name: this.customizationConfig.branding.customName,
    };
  }

  /**
   * Reads the special URLs like imprint or privacy policy from the config and returns them
   *
   * @returns A special URL DTO
   */
  private getSpecialUrls(): SpecialUrlDto {
    return {
      imprint: this.customizationConfig.specialUrls.imprint
        ? new URL(this.customizationConfig.specialUrls.imprint).toString()
        : null,
      privacy: this.customizationConfig.specialUrls.privacy
        ? new URL(this.customizationConfig.specialUrls.privacy).toString()
        : null,
      termsOfUse: this.customizationConfig.specialUrls.termsOfUse
        ? new URL(this.customizationConfig.specialUrls.termsOfUse).toString()
        : null,
    };
  }
}
