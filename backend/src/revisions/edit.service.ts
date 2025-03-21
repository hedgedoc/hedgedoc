/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { EditDto } from '@hedgedoc/commons';
import { Injectable } from '@nestjs/common';

import { Edit } from './edit.entity';

@Injectable()
export class EditService {
  async toEditDto(edit: Edit): Promise<EditDto> {
    const authorUser = await (await edit.author).user;

    return {
      username: authorUser ? authorUser.username : null,
      startPosition: edit.startPos,
      endPosition: edit.endPos,
      createdAt: edit.createdAt.toISOString(),
      updatedAt: edit.updatedAt.toISOString(),
    };
  }
}
