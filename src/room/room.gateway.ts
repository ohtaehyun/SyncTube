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
import { HostEventDto } from './dto/host-event.dto';
import { ChangeVideoDto } from './dto/change-video.dto';

@WebSocketGateway({
  cors: {
    // Chrome Web Store extension ID is assigned when the item is first uploaded.
    // Configure it on the server as a comma-separated list, for example:
    // CORS_ORIGINS=chrome-extension://your-extension-id
    origin: process.env.CORS_ORIGINS?.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean) ?? '*',
  },
})
@UseInterceptors(new WsResponseInterceptor())
export class RoomGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly roomService: RoomService) {
    this.roomService.onRoomClosed(({ code, reason }) => {
      this.server.to(code).emit('ROOM_CLOSED', { code, reason });
    });
  }

  handleConnection(client: Socket) {}

  handleDisconnect(client: Socket) {
    this.roomService.handleDisconnect(client);
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
    const room = this.roomService.joinRoom(dto.code, client);
    return {
      message: 'Joined room',
      roomCode: room.code.value,
      videoId: room.videoId,
      url: room.url(),
      currentTime: room.currentTime,
      isPlaying: room.isPlaying,
    };
  }

  @SubscribeMessage('LEAVE_ROOM')
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody(new WsValidationPipe()) dto: LeaveRoomDto,
  ) {
    this.roomService.leaveRoom(dto.code, client);
    return { message: 'Left room' };
  }

  @SubscribeMessage('HOST_EVENT')
  async handleHostEvent(
    @ConnectedSocket() client: Socket,
    @MessageBody(new WsValidationPipe()) dto: HostEventDto,
  ) {
    const state = this.roomService.updatePlayback(
      dto.code,
      client,
      dto.event,
      dto.currentTime,
    );
    client.to(dto.code.value).emit('STATE_PATCH', state);
    return state;
  }

  @SubscribeMessage('CHANGE_VIDEO')
  async handleChangeVideo(@ConnectedSocket() client: Socket, @MessageBody(new WsValidationPipe()) dto: ChangeVideoDto) {
    const state = this.roomService.changeVideo(dto.code, client, dto.videoId, dto.currentTime, dto.isPlaying);
    client.to(dto.code.value).emit('VIDEO_CHANGED', state);
    return state;
  }
}
