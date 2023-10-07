/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ConfigModule, registerAs } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { URL } from 'url';

import { AppConfig } from '../config/app.config';
import { AuthConfig } from '../config/auth.config';
import { CustomizationConfig } from '../config/customization.config';
import { DefaultAccessLevel } from '../config/default-access-level.enum';
import { ExternalServicesConfig } from '../config/external-services.config';
import { GitlabScope, GitlabVersion } from '../config/gitlab.enum';
import { GuestAccess } from '../config/guest_access.enum';
import { Loglevel } from '../config/loglevel.enum';
import { NoteConfig } from '../config/note.config';
import { LoggerModule } from '../logger/logger.module';
import { getServerVersionFromPackageJson } from '../utils/serverVersion';
import { AuthProviderType } from './frontend-config.dto';
import { FrontendConfigService } from './frontend-config.service';

/* eslint-disable
 jest/no-conditional-expect
 */

describe('FrontendConfigService', () => {
  const domain = 'http://md.example.com';
  const emptyAuthConfig: AuthConfig = {
    session: {
      secret: 'my-secret',
      lifetime: 1209600000,
    },
    local: {
      enableLogin: false,
      enableRegister: false,
      minimalPasswordStrength: 2,
    },
    github: {
      clientID: undefined,
      clientSecret: undefined,
    },
    google: {
      clientID: undefined,
      clientSecret: undefined,
      apiKey: undefined,
    },
    gitlab: [],
    ldap: [],
    saml: [],
    oauth2: [],
  };

  describe('getAuthProviders', () => {
    const github: AuthConfig['github'] = {
      clientID: 'githubTestId',
      clientSecret: 'githubTestSecret',
    };
    const google: AuthConfig['google'] = {
      clientID: 'googleTestId',
      clientSecret: 'googleTestSecret',
      apiKey: 'googleTestKey',
    };
    const gitlab: AuthConfig['gitlab'] = [
      {
        identifier: 'gitlabTestIdentifier',
        providerName: 'gitlabTestName',
        baseURL: 'gitlabTestUrl',
        clientID: 'gitlabTestId',
        clientSecret: 'gitlabTestSecret',
        scope: GitlabScope.API,
        version: GitlabVersion.V4,
      },
    ];
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
        displayNameField: 'ldapTestDisplayName',
        profilePictureField: 'ldapTestProfilePicture',
        tlsCaCerts: ['ldapTestTlsCa'],
      },
    ];
    const saml: AuthConfig['saml'] = [
      {
        identifier: 'samlTestIdentifier',
        providerName: 'samlTestName',
        idpSsoUrl: 'samlTestUrl',
        idpCert: 'samlTestCert',
        clientCert: 'samlTestClientCert',
        issuer: 'samlTestIssuer',
        identifierFormat: 'samlTestUrl',
        disableRequestedAuthnContext: 'samlTestUrl',
        groupAttribute: 'samlTestUrl',
        requiredGroups: ['samlTestUrl'],
        externalGroups: ['samlTestUrl'],
        attribute: {
          id: 'samlTestUrl',
          username: 'samlTestUrl',
          email: 'samlTestUrl',
        },
      },
    ];
    const oauth2: AuthConfig['oauth2'] = [
      {
        identifier: 'oauth2Testidentifier',
        providerName: 'oauth2TestName',
        baseURL: 'oauth2TestUrl',
        userProfileURL: 'oauth2TestProfileUrl',
        userProfileIdAttr: 'oauth2TestProfileId',
        userProfileUsernameAttr: 'oauth2TestProfileUsername',
        userProfileDisplayNameAttr: 'oauth2TestProfileDisplay',
        userProfileEmailAttr: 'oauth2TestProfileEmail',
        tokenURL: 'oauth2TestTokenUrl',
        authorizationURL: 'oauth2TestAuthUrl',
        clientID: 'oauth2TestId',
        clientSecret: 'oauth2TestSecret',
        scope: 'oauth2TestScope',
        rolesClaim: 'oauth2TestRoles',
        accessRole: 'oauth2TestAccess',
      },
    ];
    for (const authConfigConfigured of [
      github,
      google,
      gitlab,
      ldap,
      saml,
      oauth2,
    ]) {
      it(`works with ${JSON.stringify(authConfigConfigured)}`, async () => {
        const appConfig: AppConfig = {
          baseUrl: domain,
          rendererBaseUrl: 'https://renderer.example.org',
          port: 3000,
          loglevel: Loglevel.ERROR,
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
        if (authConfig.google.clientID) {
          expect(config.authProviders).toContainEqual({
            type: AuthProviderType.GOOGLE,
          });
        }
        if (authConfig.github.clientID) {
          expect(config.authProviders).toContainEqual({
            type: AuthProviderType.GITHUB,
          });
        }
        if (authConfig.local.enableLogin) {
          expect(config.authProviders).toContainEqual({
            type: AuthProviderType.LOCAL,
          });
        }
        expect(
          config.authProviders.filter(
            (provider) => provider.type === AuthProviderType.GITLAB,
          ).length,
        ).toEqual(authConfig.gitlab.length);
        expect(
          config.authProviders.filter(
            (provider) => provider.type === AuthProviderType.LDAP,
          ).length,
        ).toEqual(authConfig.ldap.length);
        expect(
          config.authProviders.filter(
            (provider) => provider.type === AuthProviderType.SAML,
          ).length,
        ).toEqual(authConfig.saml.length);
        expect(
          config.authProviders.filter(
            (provider) => provider.type === AuthProviderType.OAUTH2,
          ).length,
        ).toEqual(authConfig.oauth2.length);
        if (authConfig.gitlab.length > 0) {
          expect(
            config.authProviders.find(
              (provider) => provider.type === AuthProviderType.GITLAB,
            ),
          ).toEqual({
            type: AuthProviderType.GITLAB,
            providerName: authConfig.gitlab[0].providerName,
            identifier: authConfig.gitlab[0].identifier,
          });
        }
        if (authConfig.ldap.length > 0) {
          expect(
            config.authProviders.find(
              (provider) => provider.type === AuthProviderType.LDAP,
            ),
          ).toEqual({
            type: AuthProviderType.LDAP,
            providerName: authConfig.ldap[0].providerName,
            identifier: authConfig.ldap[0].identifier,
          });
        }
        if (authConfig.saml.length > 0) {
          expect(
            config.authProviders.find(
              (provider) => provider.type === AuthProviderType.SAML,
            ),
          ).toEqual({
            type: AuthProviderType.SAML,
            providerName: authConfig.saml[0].providerName,
            identifier: authConfig.saml[0].identifier,
          });
        }
        if (authConfig.oauth2.length > 0) {
          expect(
            config.authProviders.find(
              (provider) => provider.type === AuthProviderType.OAUTH2,
            ),
          ).toEqual({
            type: AuthProviderType.OAUTH2,
            providerName: authConfig.oauth2[0].providerName,
            identifier: authConfig.oauth2[0].identifier,
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
  for (const customLogo of [undefined, 'https://example.com/logo.png']) {
    for (const privacyLink of [undefined, 'https://example.com/privacy']) {
      for (const termsOfUseLink of [undefined, 'https://example.com/terms']) {
        for (const imprintLink of [undefined, 'https://example.com/imprint']) {
          for (const plantUmlServer of [
            undefined,
            'https://plantuml.example.com',
          ]) {
            it(`combination #${index} works`, async () => {
              const appConfig: AppConfig = {
                baseUrl: domain,
                rendererBaseUrl: 'https://renderer.example.org',
                port: 3000,
                loglevel: Loglevel.ERROR,
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
                plantUmlServer: plantUmlServer,
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
                customLogo ? new URL(customLogo) : undefined,
              );
              expect(config.maxDocumentLength).toEqual(maxDocumentLength);
              expect(config.plantUmlServer).toEqual(
                plantUmlServer ? new URL(plantUmlServer) : undefined,
              );
              expect(config.specialUrls.imprint).toEqual(
                imprintLink ? new URL(imprintLink) : undefined,
              );
              expect(config.specialUrls.privacy).toEqual(
                privacyLink ? new URL(privacyLink) : undefined,
              );
              expect(config.specialUrls.termsOfUse).toEqual(
                termsOfUseLink ? new URL(termsOfUseLink) : undefined,
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
