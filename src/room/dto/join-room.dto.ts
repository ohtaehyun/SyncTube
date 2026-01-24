import { IsString, Length, Matches } from 'class-validator';
import { RoomCodeVO } from '../vo/room-code.vo';

export class JoinRoomDto {
  @IsString()
  @Length(6, 6, { message: 'Room code must be 6 characters' })
  @Matches(/^[ABCDEFGHJKMNPQRSTVWXYZ23456789]+$/, {
    message: 'Room code contains invalid characters',
  })
  code: RoomCodeVO;
}
