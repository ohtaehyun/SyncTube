import { Socket } from 'socket.io';
import { RoomCodeVO } from '../vo/room-code.vo';

export class Room {
  private readonly _code: RoomCodeVO;
  private readonly _videoId: string;
  private readonly _host: Socket;
  private readonly _clients: Set<Socket> = new Set();
  private readonly _createdAt: Date;

  constructor(code: RoomCodeVO, host: Socket, videoId: string) {
    this._code = code;
    this._host = host;
    this._videoId = videoId;
    this._createdAt = new Date();
  }

  get code(): RoomCodeVO {
    return this._code;
  }

  addClient(client: Socket): void {
    if (this._clients.has(client)) {
      return;
    }

    this._clients.add(client);
    client.join(this._code.value);
  }

  removeClient(client: Socket): void {
    if (!this._clients.has(client)) {
      return;
    }

    this._clients.delete(client);
    client.leave(this._code.value);
  }

  isHost(client: Socket): boolean {
    return this._host.id === client.id;
  }
}
