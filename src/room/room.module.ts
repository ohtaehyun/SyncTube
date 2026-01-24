import { Module } from '@nestjs/common';
import { RoomService } from './room.service';
import { RoomGateway } from './room.gateway';
import { RoomRepository } from './room.repository';

@Module({
  providers: [RoomService, RoomGateway, RoomRepository],
})
export class RoomModule {}
