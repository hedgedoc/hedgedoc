import { Injectable } from '@nestjs/common';
import { UserInfoDto } from './user-info.dto';

@Injectable()
export class UsersService {
  getUserInfo(): UserInfoDto {
    //TODO: Use the database
    return {
      displayName: 'foo',
      userName: 'fooUser',
      email: 'foo@example.com',
      photo: '',
    };
  }
}
