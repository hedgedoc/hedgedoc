import { IsDate, IsNumber, IsString } from 'class-validator';
import { Revision } from './revision.entity';

export class RevisionMetadataDto {
  @IsString()
  id: Revision['id'];

  @IsDate()
  updatedAt: Date;

  @IsNumber()
  length: number;
}
