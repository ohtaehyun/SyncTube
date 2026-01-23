import { Injectable } from '@nestjs/common';
import { Room } from './entitiy/room.entity';
import { RoomCodeVO } from './vo/room-code.vo';

@Injectable()
export class RoomRepository {
  private readonly rooms = new Map<string, Room>();

  save(room: Room): void {
    this.rooms.set(room.code.value, room);
  }

  findByCode(code: RoomCodeVO): Room | undefined {
    return this.rooms.get(code.value);
  }

  exists(code: RoomCodeVO): boolean {
    return this.rooms.has(code.value);
  }

  delete(code: RoomCodeVO): void {
    this.rooms.delete(code.value);
  }
}
