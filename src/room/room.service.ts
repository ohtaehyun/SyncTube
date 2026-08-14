import { Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Room } from './entity/room.entity';
import { RoomRepository } from './room.repository';
import { RoomCodeVO } from './vo/room-code.vo';
import { Socket } from 'socket.io';

export interface RoomClosedEvent {
  code: string;
  reason: string;
}

@Injectable()
export class RoomService {
  private readonly hostDisconnectTimers = new Map<string, NodeJS.Timeout>();
  private readonly roomClosedListeners = new Set<
    (event: RoomClosedEvent) => void
  >();
  private static readonly HOST_DISCONNECT_GRACE_MS = 30_000;

  constructor(private readonly roomRepository: RoomRepository) {}

  createRoom(
    host: Socket,
    videoId: string,
    currentTime: number = 0,
    isPlaying: boolean = false,
  ): Room {
    for (let attempt = 0; attempt < 5; attempt++) {
      const roomCode = RoomCodeVO.generate();
      if (!this.roomRepository.exists(roomCode)) {
        const room = new Room(roomCode, host, videoId, currentTime, isPlaying);
        room.addClient(host);
        this.roomRepository.save(room);
        return room;
      }
    }

    throw new WsException(
      'Failed to generate a unique room code after multiple attempts',
    );
  }

  deleteRoom(code: RoomCodeVO, client: Socket) {
    const room = this.roomRepository.findByCode(code);
    if (room && room.isHost(client)) {
      this.removeRoom(code, 'deleted by host');
    }

    return;
  }

  joinRoom(code: RoomCodeVO, client: Socket): Room {
    const room = this.roomRepository.findByCode(code);
    if (!room) {
      throw new WsException('Room not found');
    }

    room.addClient(client);

    return room;
  }

  leaveRoom(code: RoomCodeVO, client: Socket) {
    const room = this.roomRepository.findByCode(code);
    if (!room) {
      throw new WsException('Room not found');
    }

    if (room.isHost(client)) {
      this.removeRoom(code, 'host left explicitly');
      return;
    }

    room.removeClient(client);

    return;
  }

  updatePlayback(
    code: RoomCodeVO,
    client: Socket,
    event: 'PLAY' | 'PAUSE' | 'SEEK',
    currentTime: number,
  ) {
    const room = this.roomRepository.findByCode(code);
    if (!room) throw new WsException('Room not found');
    if (!room.isHost(client)) throw new WsException('Only the host can control playback');

    if (event === 'PLAY') room.play(currentTime);
    if (event === 'PAUSE') room.pause(currentTime);
    if (event === 'SEEK') room.seek(currentTime);

    return room.playbackState();
  }

  changeVideo(code: RoomCodeVO, client: Socket, videoId: string, currentTime: number, isPlaying: boolean) {
    const room = this.roomRepository.findByCode(code);
    if (!room) throw new WsException('Room not found');
    if (!room.isHost(client)) throw new WsException('Only the host can change the video');
    room.changeVideo(videoId, currentTime, isPlaying);
    return { videoId: room.videoId, ...room.playbackState() };
  }

  handleDisconnect(client: Socket): void {
    const rooms = this.roomRepository.findByClient(client);

    for (const room of rooms) {
      room.removeClient(client);

      if (room.isHost(client)) {
        this.scheduleHostDisconnectDeletion(room);
      }
    }
  }

  onRoomClosed(listener: (event: RoomClosedEvent) => void): void {
    this.roomClosedListeners.add(listener);
  }

  private scheduleHostDisconnectDeletion(room: Room): void {
    const code = room.code.value;
    if (this.hostDisconnectTimers.has(code)) return;


    const timer = setTimeout(() => {
      this.hostDisconnectTimers.delete(code);
      if (this.roomRepository.exists(room.code)) {
        this.removeRoom(room.code, 'host did not reconnect within 30 seconds');
      }
    }, RoomService.HOST_DISCONNECT_GRACE_MS);

    this.hostDisconnectTimers.set(code, timer);
  }

  private removeRoom(code: RoomCodeVO, reason: string): void {
    if (!this.roomRepository.exists(code)) return;

    const timer = this.hostDisconnectTimers.get(code.value);
    if (timer) {
      clearTimeout(timer);
      this.hostDisconnectTimers.delete(code.value);
    }

    for (const listener of this.roomClosedListeners) {
      listener({ code: code.value, reason });
    }

    this.roomRepository.delete(code);
  }
}
