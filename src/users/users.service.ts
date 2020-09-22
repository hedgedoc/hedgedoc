import { Injectable, Logger } from '@nestjs/common';
import { UserInfoDto } from './user-info.dto';
import { User } from './user.entity';

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

  getPhotoUrl(user: User) {
    if (user.photo) {
      return user.photo;
    } else {
      // TODO: Create new photo, see old code
      return '';
    }
  }

  toUserDto(user: User): UserInfoDto {
    if (user === undefined) {
      this.logger.warn('toUserDto recieved undefined argument!');
      return null;
    }
    if (user === null) {
      this.logger.warn('toUserDto recieved null argument!');
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
