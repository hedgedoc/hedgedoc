/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';
import { Loglevel } from './loglevel.enum';
import { appConfigHsts, HstsConfig, hstsSchema } from './hsts-config';
import { appConfigCsp, CspConfig, cspSchema } from './csp-config';
import { appConfigMedia, MediaConfig, mediaSchema } from './media-config';
import { appConfigDatabase, DatabaseConfig, databaseSchema } from './database-config';
import { appConfigAuth, AuthConfig, authSchema } from './auth-config';

// import { LinkifyHeaderStyle } from './linkify-header-style';

export interface AppConfig {
  domain: string;
  port: number;
  loglevel: Loglevel;
  /*linkifyHeaderStyle: LinkifyHeaderStyle;
  sourceURL: string;
  urlPath: string;
  host: string;
  path: string;
  urlAddPort: boolean;
  cookiePolicy: string;
  protocolUseSSL: boolean;
  allowOrigin: string[];
  useCDN: boolean;
  enableAnonymous: boolean;
  enableAnonymousEdits: boolean;
  enableFreeURL: boolean;
  forbiddenNoteIDs: string[];
  defaultPermission: string;
  sessionSecret: string;
  sessionLife: number;
  tooBusyLag: number;
  enableGravatar: boolean;*/
  hsts: HstsConfig;
  csp: CspConfig;
  media: MediaConfig;
  database: DatabaseConfig;
  auth: AuthConfig;
}

const schema = Joi.object({
  domain: Joi.string(),
  port: Joi.number().default(3000).optional(),
  loglevel: Joi.string()
    .valid(...Object.values(Loglevel))
    .default(Loglevel.WARN)
    .optional(),
  /*linkifyHeaderStyle: Joi.string().valid(...Object.values(LinkifyHeaderStyle)).default(LinkifyHeaderStyle.GFM).optional(),
  sourceURL: Joi.string(),
  urlPath: Joi.string(),
  host: Joi.string().default('::').optional(),
  path: Joi.string(),
  urlAddPort: Joi.boolean().default(false).optional(),
  cookiePolicy: Joi.string(),
  protocolUseSSL: Joi.boolean().default(true).optional(),
  allowOrigin: Joi.array().items(Joi.string()),
  useCDN: Joi.boolean().default(false).optional(),
  enableAnonymous: Joi.boolean().default(true).optional(),
  enableAnonymousEdits: Joi.boolean().default(false).optional(),
  enableFreeURL: Joi.boolean().default(false).optional(),
  forbiddenNoteIDs: Joi.array().items(Joi.string()),
  defaultPermission: Joi.string(),
  sessionSecret: Joi.string(),
  sessionLife: Joi.number().default(14 * 24 * 60 * 60 * 1000).optional(),
  tooBusyLag: Joi.number().default(70).optional(),
  enableGravatar: Joi.boolean().default(true).optional(),*/
  hsts: hstsSchema,
  csp: cspSchema,
  media: mediaSchema,
  database: databaseSchema,
  auth: authSchema,
});

export default registerAs('appConfig', async () => {
  const appConfig = schema.validate(
    {
      domain: process.env.HD_DOMAIN,
      port: parseInt(process.env.PORT) || undefined,
      loglevel: process.env.HD_LOGLEVEL, //|| Loglevel.WARN,
      /*linkifyHeaderStyle: process.env.HD_LINKIFY_HEADER_STYLE,
      sourceURL: process.env.HD_SOURCE_URL,
      urlPath: process.env.HD_URL_PATH,
      host: process.env.HD_HOST || '::',
      path: process.env.HD_PATH,
      urlAddPort: process.env.HD_URL_ADDPORT,
      cookiePolicy: process.env.HD_COOKIE_POLICY,
      protocolUseSSL: process.env.HD_PROTOCOL_USESSL || true,
      allowOrigin: toArrayConfig(process.env.HD_ALLOW_ORIGIN),
      useCDN: process.env.HD_USECDN,
      enableAnonymous: process.env.HD_ENABLE_ANONYMOUS || true,
      enableAnonymousEdits: process.env.HD_ENABLE_ANONYMOUS_EDITS,
      enableFreeURL: process.env.HD_ENABLE_FREEURL,
      forbiddenNoteIDs: toArrayConfig(process.env.HD_FORBIDDEN_NOTE_IDS),
      defaultPermission: process.env.HD_DEFAULT_PERMISSION,
      sessionSecret: process.env.HD_SESSION_SECRET,
      sessionLife: parseInt(process.env.HD_SESSION_LIFE) || 14 * 24 * 60 * 60 * 1000,
      tooBusyLag: parseInt(process.env.HD_TOOBUSY_LAG) || 70,
      enableGravatar: process.env.HD_ENABLE_GRAVATAR || true,*/
      hsts: appConfigHsts,
      csp: appConfigCsp,
      media: appConfigMedia,
      database: appConfigDatabase,
      auth: appConfigAuth,
    },
    {
      abortEarly: false,
      presence: 'required',
    },
  );
  if (appConfig.error) {
    throw new Error(appConfig.error.toString());
  }
  return appConfig.value;
});
