import { Injectable } from '@nestjs/common';
import { ConsoleLoggerService } from '../logger/console-logger.service';
import { UserInfoDto } from './user-info.dto';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(private readonly logger: ConsoleLoggerService) {
    this.logger.setContext(UsersService.name);
  }

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

  getPhotoUrl(user: User) {
    if (user.photo) {
      return user.photo;
    } else {
      // TODO: Create new photo, see old code
      return '';
    }
  }

  toUserDto(user: User | null | undefined): UserInfoDto | null {
    if (!user) {
      this.logger.warn(`Recieved ${user} argument!`, 'toUserDto');
      return null;
    }
    return {
      userName: user.userName,
      displayName: user.displayName,
      photo: this.getPhotoUrl(user),
      email: user.email,
    };
  }
}
