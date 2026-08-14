import { IsBoolean, IsNumber, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import { RoomCodeVO } from '../vo/room-code.vo';

export class ChangeVideoDto {
  @Transform(({ value }) => new RoomCodeVO(value)) @IsNotEmpty() code!: RoomCodeVO;
  @IsString() videoId!: string;
  @IsNumber() currentTime!: number;
  @IsBoolean() isPlaying!: boolean;
}
