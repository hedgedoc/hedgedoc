/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { GuestAccess, ProviderType } from '@hedgedoc/commons';
import { ConfigModule, registerAs } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { URL } from 'url';

import { AppConfig } from '../config/app.config';
import { AuthConfig } from '../config/auth.config';
import { CustomizationConfig } from '../config/customization.config';
import { DefaultAccessLevel } from '../config/default-access-level.enum';
import { ExternalServicesConfig } from '../config/external-services.config';
import { Loglevel } from '../config/loglevel.enum';
import { NoteConfig } from '../config/note.config';
import { LoggerModule } from '../logger/logger.module';
import { getServerVersionFromPackageJson } from '../utils/serverVersion';
import { FrontendConfigService } from './frontend-config.service';

/* eslint-disable
 jest/no-conditional-expect
 */

describe('FrontendConfigService', () => {
  const domain = 'http://md.example.com';
  const emptyAuthConfig: AuthConfig = {
    common: {
      allowProfileEdits: true,
      allowChooseUsername: true,
      syncSource: undefined,
    },
    session: {
      secret: 'my-secret',
      lifetime: 1209600000,
    },
    local: {
      enableLogin: false,
      enableRegister: false,
      minimalPasswordStrength: 2,
    },
    ldap: [],
    oidc: [],
  };

  describe('getAuthProviders', () => {
    const ldap: AuthConfig['ldap'] = [
      {
        identifier: 'ldapTestIdentifier',
        providerName: 'ldapTestName',
        url: 'ldapTestUrl',
        bindDn: 'ldapTestBindDn',
        bindCredentials: 'ldapTestBindCredentials',
        searchBase: 'ldapTestSearchBase',
        searchFilter: 'ldapTestSearchFilter',
        searchAttributes: ['ldapTestSearchAttribute'],
        userIdField: 'ldapTestUserId',
        emailField: 'ldapEmailField',
        displayNameField: 'ldapTestDisplayName',
        profilePictureField: 'ldapTestProfilePicture',
        tlsCaCerts: ['ldapTestTlsCa'],
      },
    ];
    const oidc: AuthConfig['oidc'] = [
      {
        identifier: 'oidcTestIdentifier',
        providerName: 'oidcTestProviderName',
        issuer: 'oidcTestIssuer',
        clientId: 'oidcTestId',
        clientSecret: 'oidcTestSecret',
        scope: 'openid profile email',
        userIdField: '',
        usernameField: '',
        displayNameField: '',
        profilePictureField: '',
        emailField: '',
      },
    ];
    for (const authConfigConfigured of [ldap, oidc]) {
      it(`works with ${JSON.stringify(authConfigConfigured)}`, async () => {
        const appConfig: AppConfig = {
          baseUrl: domain,
          rendererBaseUrl: 'https://renderer.example.org',
          backendPort: 3000,
          loglevel: Loglevel.ERROR,
          showLogTimestamp: false,
          persistInterval: 10,
        };
        const authConfig: AuthConfig = {
          ...emptyAuthConfig,
          ...authConfigConfigured,
        };
        const module: TestingModule = await Test.createTestingModule({
          imports: [
            ConfigModule.forRoot({
              isGlobal: true,
              load: [
                registerAs('appConfig', () => appConfig),
                registerAs('authConfig', () => authConfig),
                registerAs('customizationConfig', () => {
                  return { branding: {}, specialUrls: {} };
                }),
                registerAs('externalServicesConfig', () => {
                  return {};
                }),
                registerAs('noteConfig', () => {
                  return {
                    forbiddenNoteIds: [],
                    maxDocumentLength: 200,
                    guestAccess: GuestAccess.CREATE,
                    permissions: {
                      default: {
                        everyone: DefaultAccessLevel.READ,
                        loggedIn: DefaultAccessLevel.WRITE,
                      },
                    },
                    revisionRetentionDays: 0,
                  } as NoteConfig;
                }),
              ],
            }),
            LoggerModule,
          ],
          providers: [FrontendConfigService],
        }).compile();
        const service = module.get(FrontendConfigService);
        const config = await service.getFrontendConfig();
        if (authConfig.local.enableLogin) {
          expect(config.authProviders).toContainEqual({
            type: ProviderType.LOCAL,
          });
        }
        expect(
          config.authProviders.filter(
            (provider) => provider.type === ProviderType.LDAP,
          ).length,
        ).toEqual(authConfig.ldap.length);
        expect(
          config.authProviders.filter(
            (provider) => provider.type === ProviderType.OIDC,
          ).length,
        ).toEqual(authConfig.oidc.length);
        if (authConfig.ldap.length > 0) {
          expect(
            config.authProviders.find(
              (provider) => provider.type === ProviderType.LDAP,
            ),
          ).toEqual({
            type: ProviderType.LDAP,
            providerName: authConfig.ldap[0].providerName,
            identifier: authConfig.ldap[0].identifier,
          });
        }
        if (authConfig.oidc.length > 0) {
          expect(
            config.authProviders.find(
              (provider) => provider.type === ProviderType.OIDC,
            ),
          ).toEqual({
            type: ProviderType.OIDC,
            providerName: authConfig.oidc[0].providerName,
            identifier: authConfig.oidc[0].identifier,
          });
        }
      });
    }
  });

  const maxDocumentLength = 100000;
  const enableRegister = true;
  const imageProxy = 'https://imageProxy.example.com';
  const customName = 'Test Branding Name';

  let index = 1;
  for (const customLogo of [null, 'https://example.com/logo.png']) {
    for (const privacyLink of [null, 'https://example.com/privacy']) {
      for (const termsOfUseLink of [null, 'https://example.com/terms']) {
        for (const imprintLink of [null, 'https://example.com/imprint']) {
          for (const plantUmlServer of [null, 'https://plantuml.example.com']) {
            it(`combination #${index} works`, async () => {
              const appConfig: AppConfig = {
                baseUrl: domain,
                rendererBaseUrl: 'https://renderer.example.org',
                backendPort: 3000,
                loglevel: Loglevel.ERROR,
                showLogTimestamp: false,
                persistInterval: 10,
              };
              const authConfig: AuthConfig = {
                ...emptyAuthConfig,
                local: {
                  enableLogin: true,
                  enableRegister,
                  minimalPasswordStrength: 3,
                },
              };
              const customizationConfig: CustomizationConfig = {
                branding: {
                  customName: customName,
                  customLogo: customLogo,
                },
                specialUrls: {
                  privacy: privacyLink,
                  termsOfUse: termsOfUseLink,
                  imprint: imprintLink,
                },
              };
              const externalServicesConfig: ExternalServicesConfig = {
                plantumlServer: plantUmlServer,
                imageProxy: imageProxy,
              };
              const noteConfig: NoteConfig = {
                forbiddenNoteIds: [],
                maxDocumentLength: maxDocumentLength,
                guestAccess: GuestAccess.CREATE,
                permissions: {
                  default: {
                    everyone: DefaultAccessLevel.READ,
                    loggedIn: DefaultAccessLevel.WRITE,
                  },
                },
                revisionRetentionDays: 0,
              };
              const module: TestingModule = await Test.createTestingModule({
                imports: [
                  ConfigModule.forRoot({
                    isGlobal: true,
                    load: [
                      registerAs('appConfig', () => appConfig),
                      registerAs('authConfig', () => authConfig),
                      registerAs(
                        'customizationConfig',
                        () => customizationConfig,
                      ),
                      registerAs(
                        'externalServicesConfig',
                        () => externalServicesConfig,
                      ),
                      registerAs('noteConfig', () => noteConfig),
                    ],
                  }),
                  LoggerModule,
                ],
                providers: [FrontendConfigService],
              }).compile();

              const service = module.get(FrontendConfigService);
              const config = await service.getFrontendConfig();
              expect(config.allowRegister).toEqual(enableRegister);
              expect(config.guestAccess).toEqual(noteConfig.guestAccess);
              expect(config.branding.name).toEqual(customName);
              expect(config.branding.logo).toEqual(
                customLogo !== null ? new URL(customLogo).toString() : null,
              );
              expect(config.maxDocumentLength).toEqual(maxDocumentLength);
              expect(config.plantUmlServer).toEqual(
                plantUmlServer !== null
                  ? new URL(plantUmlServer).toString()
                  : null,
              );
              expect(config.specialUrls.imprint).toEqual(
                imprintLink !== null ? new URL(imprintLink).toString() : null,
              );
              expect(config.specialUrls.privacy).toEqual(
                privacyLink !== null ? new URL(privacyLink).toString() : null,
              );
              expect(config.specialUrls.termsOfUse).toEqual(
                termsOfUseLink !== null
                  ? new URL(termsOfUseLink).toString()
                  : null,
              );
              expect(config.useImageProxy).toEqual(!!imageProxy);
              expect(config.version).toEqual(
                await getServerVersionFromPackageJson(),
              );
            });
            index += 1;
          }
        }
      }
    }
  }
});
