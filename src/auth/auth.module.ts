import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { TokenStrategy } from './token.strategy';

@Module({
  imports: [UsersModule, PassportModule],
  providers: [AuthService, TokenStrategy],
})
export class AuthModule {}
