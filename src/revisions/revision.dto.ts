import { IsNumber, IsString } from 'class-validator';
import { Revision } from './revision.entity';

export class RevisionDto {
  @IsNumber()
  id: Revision['id'];
  @IsString()
  content: string;
  @IsString()
  patch: string;
}
