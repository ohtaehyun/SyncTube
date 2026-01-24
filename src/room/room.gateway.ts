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
}
