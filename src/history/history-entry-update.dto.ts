import { IsBoolean } from 'class-validator';

export class HistoryEntryUpdateDto {
  @IsBoolean()
  pinStatus: boolean;
}
