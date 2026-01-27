import { Injectable } from '@nestjs/common';
import { Room } from './entity/room.entity';
import { RoomRepository } from './room.repository';
import { RoomCodeVO } from './vo/room-code.vo';
import { Socket } from 'socket.io';

@Injectable()
export class RoomService {
  constructor(private readonly roomRepository: RoomRepository) {}

  createRoom(host: Socket, videoId: string): Room {
    for (let attempt = 0; attempt < 5; attempt++) {
      const roomCode = RoomCodeVO.generate();
      if (!this.roomRepository.exists(roomCode)) {
        const room = new Room(roomCode, host, videoId);
        this.roomRepository.save(room);
        return room;
      }
    }

    throw new Error(
      'Failed to generate a unique room code after multiple attempts',
    );
  }

  deleteRoom(code: RoomCodeVO, client: Socket) {
    const room = this.roomRepository.findByCode(code);
    if (room && room.isHost(client)) {
      this.roomRepository.delete(code);
    }

    return;
  }

  joinRoom(code: RoomCodeVO, client: Socket) {
    const room = this.roomRepository.findByCode(code);
    if (!room) {
      throw new Error('Room not found');
    }

    room.addClient(client);

    return;
  }

  leaveRoom(code: RoomCodeVO, client: Socket) {
    const room = this.roomRepository.findByCode(code);
    if (!room) {
      throw new Error('Room not found');
    }

    room.removeClient(client);

    return;
  }
}
