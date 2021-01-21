import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async validateToken(token: string): Promise<User> {
    const parts = token.split('.');
    const user = await this.usersService.getUserByAuthToken(parts[0], parts[1]);
    if (user) {
      await this.usersService.setLastUsedToken(parts[0])
      return user;
    }
    return null;
  }
}
