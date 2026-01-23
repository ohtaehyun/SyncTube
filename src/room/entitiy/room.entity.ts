import { Socket } from 'socket.io';
import { RoomCodeVO } from '../vo/room-code.vo';

export class Room {
  private readonly _code: RoomCodeVO;
  private readonly _host: Socket;
  private readonly _clients: Set<Socket> = new Set();
  private readonly _createdAt: Date;

  constructor(code: RoomCodeVO, host: Socket) {
    this._code = code;
    this._host = host;
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
}
