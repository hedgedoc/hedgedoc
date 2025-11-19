/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { AuthProviderType } from '@hedgedoc/database';
import request from 'supertest';

import { PRIVATE_API_PREFIX } from '../../src/app.module';
import { getServerVersionFromPackageJson } from '../../src/utils/server-version';
import { TestSetup, TestSetupBuilder } from '../test-setup';

describe('Config', () => {
  let testSetup: TestSetup;

  beforeEach(async () => {
    testSetup = await TestSetupBuilder.create().withUsers().build();
    await testSetup.app.init();
  });

  afterEach(async () => {
    await testSetup.app.close();
    await testSetup.cleanup();
  });

  describe(`GET ${PRIVATE_API_PREFIX}/config`, () => {
    it('returns the frontend config', async () => {
      const noteConfig = testSetup.configService.get('noteConfig');
      const authConfig = testSetup.configService.get('authConfig');
      const customizationConfig = testSetup.configService.get(
        'customizationConfig',
      );
      const externalServicesConfig = testSetup.configService.get(
        'externalServicesConfig',
      );

      const response = await request(testSetup.app.getHttpServer())
        .get(`${PRIVATE_API_PREFIX}/config`)
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);
      const responseBody = response.body;
      expect(responseBody.guestAccess).toEqual(
        noteConfig.permissions.maxGuestLevel,
      );
      expect(responseBody.allowRegister).toEqual(
        authConfig.local.enableRegister,
      );
      expect(responseBody.allowProfileEdits).toEqual(
        authConfig.common.allowProfileEdits,
      );
      expect(responseBody.allowChooseUsername).toEqual(
        authConfig.common.allowChooseUsername,
      );
      expect(responseBody.authProviders).toHaveLength(1);
      expect(responseBody.authProviders[0]).toEqual({
        type: AuthProviderType.LOCAL,
      });
      expect(responseBody.branding).toEqual({
        logo: null,
        name: customizationConfig.branding.customName,
      });
      expect(responseBody.maxDocumentLength).toEqual(
        noteConfig.maxDocumentLength,
      );
      expect(responseBody.plantUmlServer).toEqual(
        new URL(externalServicesConfig.plantumlServer).toString(),
      );
      expect(responseBody.specialUrls).toEqual({
        imprint: new URL(customizationConfig.specialUrls.imprint).toString(),
        privacy: new URL(customizationConfig.specialUrls.privacy).toString(),
        termsOfUse: new URL(
          customizationConfig.specialUrls.termsOfUse,
        ).toString(),
      });
      expect(responseBody.useImageProxy).toEqual(
        !!externalServicesConfig.imageProxy,
      );
      expect(responseBody.version).toEqual(
        await getServerVersionFromPackageJson(),
      );
    });
  });
});
