import { IsString } from 'class-validator';
import { Revision } from './revision.entity';

export class RevisionDto {
  @IsString()
  id: Revision['id'];
  @IsString()
  content: string;
  @IsString()
  patch: string;
}
