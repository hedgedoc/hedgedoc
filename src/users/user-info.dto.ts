import { IsString } from 'class-validator';

export class UserInfoDto {
  @IsString()
  userName: string;
  @IsString()
  displayName: string;
  @IsString()
  photo: string;
  @IsString()
  email: string;
}
