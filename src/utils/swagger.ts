/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { PrivateApiModule } from '../api/private/private-api.module';
import { PublicApiModule } from '../api/public/public-api.module';

export function setupPublicApiDocs(app: INestApplication) {
  const publicApiOptions = new DocumentBuilder()
    .setTitle('HedgeDoc Public API')
    // TODO: Use real version
    .setVersion('2.0-dev')
    .addSecurity('token', {
      type: 'http',
      scheme: 'bearer',
    })
    .build();
  const publicApi = SwaggerModule.createDocument(app, publicApiOptions, {
    include: [PublicApiModule],
  });
  SwaggerModule.setup('apidoc', app, publicApi);
}

export function setupPrivateApiDocs(app: INestApplication) {
  const privateApiOptions = new DocumentBuilder()
    .setTitle('HedgeDoc Private API')
    // TODO: Use real version
    .setVersion('2.0-dev')
    .build();

  const privateApi = SwaggerModule.createDocument(app, privateApiOptions, {
    include: [PrivateApiModule],
  });
  SwaggerModule.setup('private/apidoc', app, privateApi);
}
