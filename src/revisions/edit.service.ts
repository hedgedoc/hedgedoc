/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Injectable } from '@nestjs/common';

import { EditDto } from './edit.dto';
import { Edit } from './edit.entity';

@Injectable()
export class EditService {
  async toEditDto(edit: Edit): Promise<EditDto> {
    const authorUser = await (await edit.author).user;

    return {
      username: authorUser ? authorUser.username : null,
      startPos: edit.startPos,
      endPos: edit.endPos,
      createdAt: edit.createdAt,
      updatedAt: edit.updatedAt,
    };
  }
}
