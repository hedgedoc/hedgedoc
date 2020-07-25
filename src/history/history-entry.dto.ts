import { IsBoolean, ValidateNested } from 'class-validator';
import { NoteMetadataDto } from '../notes/note-metadata.dto';

export class HistoryEntryDto {
  @ValidateNested()
  metadata: NoteMetadataDto;
  @IsBoolean()
  pinStatus: boolean;
}
