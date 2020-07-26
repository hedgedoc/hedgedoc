import { Injectable, Logger } from '@nestjs/common';
import { UserInfoDto } from './user-info.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  getUserInfo(): UserInfoDto {
    //TODO: Use the database
    this.logger.warn('Using hardcoded data!');
    return {
      displayName: 'foo',
      userName: 'fooUser',
      email: 'foo@example.com',
      photo: '',
    };
  }
}
