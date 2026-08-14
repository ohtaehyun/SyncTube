import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  videoId!: string;

  @IsNumber()
  currentTime: number = 0;

  @IsBoolean()
  isPlaying: boolean = false;
}
