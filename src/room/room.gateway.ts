import {
  WebSocketGateway,
  SubscribeMessage,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RoomService } from './room.service';
import { DeleteRoomDto } from './dto/delete-room.dto';
import { JoinRoomDto } from './dto/join-room.dto';
import { LeaveRoomDto } from './dto/leave-room.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class RoomGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly roomService: RoomService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('CREATE_ROOM')
  async handleCreateRoom(@ConnectedSocket() client: Socket) {
    const room = this.roomService.createRoom(client);
    return { code: room.code.value };
  }

  @SubscribeMessage('DELETE_ROOM')
  async handleDeleteRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: DeleteRoomDto,
  ) {
    this.roomService.deleteRoom(dto.code, client);
    return { message: 'Deleted room' };
  }

  @SubscribeMessage('JOIN_ROOM')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: JoinRoomDto,
  ) {
    this.roomService.joinRoom(dto.code, client);

    return { message: 'Joined room' };
  }

  @SubscribeMessage('LEAVE_ROOM')
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: LeaveRoomDto,
  ) {
    this.roomService.leaveRoom(dto.code, client);
    return { message: 'Left room' };
  }
}
