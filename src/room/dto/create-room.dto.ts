import { IsString } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  videoId: string;
}
