import { Injectable } from '@nestjs/common';
import { Room } from './room.entity';
import { RoomRepository } from './room.repository';
import { RoomCodeVO } from './vo/room-code.vo';

@Injectable()
export class RoomService {
  constructor(private readonly roomRepository: RoomRepository) {}

  createRoom() {
    for (let attempt = 0; attempt < 5; attempt++) {
      const roomCode = RoomCodeVO.generate();
      if (!this.roomRepository.exists(roomCode)) {
        const room = new Room(roomCode);
        this.roomRepository.save(room);
        return room;
      }
    }

    throw new Error(
      'Failed to generate a unique room code after multiple attempts',
    );
  }
}
