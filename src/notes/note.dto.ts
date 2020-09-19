import { IsArray, IsString, ValidateNested } from 'class-validator';
import { NoteAuthorshipDto } from './note-authorship.dto';
import { NoteMetadataDto } from './note-metadata.dto';

export class NoteDto {
  @IsString()
  content: string;

  @ValidateNested()
  metadata: NoteMetadataDto;

  @IsArray()
  @ValidateNested({ each: true })
  editedByAtPosition: NoteAuthorshipDto[];
}
