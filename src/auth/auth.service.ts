import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async validateToken(token: string): Promise<User> {
    const user = await this.usersService.getUserByAuthToken(token);
    if (user) {
      return user;
    }
    return null;
  }
}
