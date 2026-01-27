import { Transform } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import { RoomCodeVO } from '../vo/room-code.vo';

export class DeleteRoomDto {
  @Transform(({ value }) => new RoomCodeVO(value))
  @IsNotEmpty()
  code: RoomCodeVO;
}
