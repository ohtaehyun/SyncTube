import {
  WebSocketGateway,
  SubscribeMessage,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  MessageBody,
} from '@nestjs/websockets';
import { UseInterceptors } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { RoomService } from './room.service';
import { WsResponseInterceptor } from './interceptors/ws-response.interceptor';
import { WsValidationPipe } from './pipes/ws-validation.pipe';
import { DeleteRoomDto } from './dto/delete-room.dto';
import { JoinRoomDto } from './dto/join-room.dto';
import { LeaveRoomDto } from './dto/leave-room.dto';
import { CreateRoomDto } from './dto/create-room.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@UseInterceptors(new WsResponseInterceptor())
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
  async handleCreateRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: CreateRoomDto,
  ) {
    const room = this.roomService.createRoom(
      client,
      dto.videoId,
      dto.currentTime,
      dto.isPlaying,
    );

    console.log(dto);
    return { code: room.code.value };
  }

  @SubscribeMessage('DELETE_ROOM')
  async handleDeleteRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody(new WsValidationPipe()) dto: DeleteRoomDto,
  ) {
    this.roomService.deleteRoom(dto.code, client);
    return { message: 'Deleted room' };
  }

  @SubscribeMessage('JOIN_ROOM')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody(new WsValidationPipe()) dto: JoinRoomDto,
  ) {
    console.log('join room request received with code:', dto.code.value);
    const room = this.roomService.joinRoom(dto.code, client);
    const response = {
      message: 'Joined room',
      roomCode: room.code.value,
      videoId: room.videoId,
      url: room.url(),
    };

    console.log('join room response:', response);

    return {
      message: 'Joined room',
      roomCode: room.code.value,
      videoId: room.videoId,
      url: room.url(),
    };
  }

  @SubscribeMessage('LEAVE_ROOM')
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody(new WsValidationPipe()) dto: LeaveRoomDto,
  ) {
    this.roomService.leaveRoom(dto.roomCode, client);
    return { message: 'Left room' };
  }
}
