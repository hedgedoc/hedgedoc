import { IsDate, IsNumber, IsString } from 'class-validator';
import { Revision } from './revision.entity';

export class RevisionMetadataDto {
  @IsNumber()
  id: Revision['id'];

  @IsDate()
  updatedAt: Date;

  @IsNumber()
  length: number;
}
