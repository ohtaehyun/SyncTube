import { IsIn, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import { RoomCodeVO } from '../vo/room-code.vo';

export class HostEventDto {
  @Transform(({ value }) => new RoomCodeVO(value))
  @IsNotEmpty()
  code!: RoomCodeVO;

  @IsIn(['PLAY', 'PAUSE', 'SEEK'])
  event!: 'PLAY' | 'PAUSE' | 'SEEK';

  @IsNumber()
  currentTime!: number;
}
