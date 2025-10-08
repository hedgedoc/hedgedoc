/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { PrivateApiModule } from '../api/private/private-api.module';
import { PublicApiModule } from '../api/public/public-api.module';
import { getServerVersionFromPackageJson } from './server-version';

export const PUBLIC_API_PATH = 'api/doc/v2';
export const PRIVATE_API_PATH = 'api/doc/private';

/**
 * Sets up the public API documentation for HedgeDoc.
 *
 * @param app The NestJS application instance to set up the Swagger module on.
 */
export async function setupPublicApiDocs(app: INestApplication): Promise<void> {
  const version = await getServerVersionFromPackageJson();
  const publicApiOptions = new DocumentBuilder()
    .setTitle('HedgeDoc Public API')
    .setVersion(version.fullString)
    .addSecurity('token', {
      type: 'http',
      scheme: 'bearer',
    })
    .build();
  const publicApi = SwaggerModule.createDocument(app, publicApiOptions, {
    include: [PublicApiModule],
  });
  SwaggerModule.setup(PUBLIC_API_PATH, app, publicApi);
}

/**
 * Sets up the private API documentation for HedgeDoc.
 *
 * @param app The NestJS application instance to set up the Swagger module on.
 */
export async function setupPrivateApiDocs(
  app: INestApplication,
): Promise<void> {
  const version = await getServerVersionFromPackageJson();
  const privateApiOptions = new DocumentBuilder()
    .setTitle('HedgeDoc Private API')
    .setVersion(version.fullString)
    .build();

  const privateApi = SwaggerModule.createDocument(app, privateApiOptions, {
    include: [PrivateApiModule],
  });
  SwaggerModule.setup(PRIVATE_API_PATH, app, privateApi);
}
