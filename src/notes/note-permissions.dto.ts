import { IsArray, IsBoolean, ValidateNested } from 'class-validator';
import { UserInfoDto } from '../users/user-info.dto';

export class NotePermissionEntryDto {
  @ValidateNested()
  user: UserInfoDto;
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
