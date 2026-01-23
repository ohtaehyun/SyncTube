import { IsString, Length, Matches } from 'class-validator';

export class RoomCodeDto {
  @IsString()
  @Length(6, 6, { message: 'Room code must be 6 characters' })
  @Matches(/^[ABCDEFGHJKMNPQRSTVWXYZ23456789]+$/, {
    message: 'Room code contains invalid characters',
  })
  code: string;
}
