/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import appConfiguration, { AppConfig } from '../config/app.config';
import { getVersionString } from './serverVersion';

@Injectable()
export class AddVersionInterceptor<T> implements NestInterceptor {
  constructor(
    @Inject(appConfiguration.KEY)
    private appConfig: AppConfig,
  ) {}
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<T>> {
    return next.handle().pipe(
      tap(async () => {
        const version = await getVersionString();
        let response = context.switchToHttp().getResponse();
        response.header('HedgeDoc-Version', version);
      }),
    );
  }
}
