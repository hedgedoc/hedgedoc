import { IsArray, IsBoolean, IsString, ValidateNested } from 'class-validator';
import { UserInfoDto } from '../users/user-info.dto';

export class NotePermissionEntryDto {
  @ValidateNested()
  user: UserInfoDto;
  @IsBoolean()
  canEdit: boolean;
}

export class NotePermissionEntryUpdateDto {
  @IsString()
  username: string;
  @IsBoolean()
  canEdit: boolean;
}

export class NotePermissionsDto {
  @ValidateNested()
  owner: UserInfoDto;
  @ValidateNested()
  @IsArray()
  sharedTo: NotePermissionEntryDto[];
}

export class NotePermissionsUpdateDto {
  @IsArray()
  @ValidateNested()
  sharedTo: NotePermissionEntryUpdateDto[];
}
