import { IsArray, IsBoolean, IsString, ValidateNested } from 'class-validator';
import { UserInfoDto } from '../users/user-info.dto';

export class NoteUserPermissionEntryDto {
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

export class GroupInfoDto {
  @IsString()
  id: string
  @IsString()
  displayName: string
}

export class NoteGroupPermissionEntryDto {
  @ValidateNested()
  group: GroupInfoDto
  @IsBoolean()
  canEdit: boolean
}

export class NotePermissionsDto {
  @ValidateNested()
  owner: UserInfoDto;
  @ValidateNested()
  @IsArray()
  sharedToUsers: NoteUserPermissionEntryDto[];
  @ValidateNested()
  @IsArray()
  sharedToGroups: NoteGroupPermissionEntryDto[];
}

export class NotePermissionsUpdateDto {
  @IsArray()
  @ValidateNested()
  sharedTo: NotePermissionEntryUpdateDto[];
}
