import { Transform } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import { RoomCodeVO } from '../vo/room-code.vo';

export class LeaveRoomDto {
  @Transform(({ value }) => new RoomCodeVO(value))
  @IsNotEmpty()
  code!: RoomCodeVO;
}
