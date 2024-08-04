/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { PrivateApiModule } from '../api/private/private-api.module';
import { PublicApiModule } from '../api/public/public-api.module';
import { getServerVersionFromPackageJson } from './serverVersion';

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
  SwaggerModule.setup('api/doc/v2', app, publicApi);
}

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
  SwaggerModule.setup('api/doc/private', app, privateApi);
}
