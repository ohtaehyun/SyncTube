import { Controller, Delete, Param, Post } from '@nestjs/common';
import { RoomService } from './room.service';
import { RoomCodePipe } from './pipes/room-code.pipe';
import { RoomCodeVO } from './vo/room-code.vo';

@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post()
  createRoom() {
    return this.roomService.createRoom();
  }

  @Delete(':code')
  deleteRoom(@Param('code', RoomCodePipe) code: RoomCodeVO) {
    this.roomService.deleteRoom(code);
    return { message: 'Deleted room' };
  }

  @Post(':code/join')
  joinRoom(@Param('code', RoomCodePipe) code: RoomCodeVO) {
    this.roomService.joinRoom(code);
  }
}
