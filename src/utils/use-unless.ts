/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { NextFunction, Request, Response } from 'express';

export function useUnless(
  paths: string[],
  middleware: (req: Request, res: Response, next: NextFunction) => unknown,
) {
  return function (req: Request, res: Response, next: NextFunction): unknown {
    if (paths.some((path) => req.path.startsWith(path))) {
      return next();
    }
    return middleware(req, res, next);
  };
}
