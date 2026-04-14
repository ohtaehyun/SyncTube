import { Socket } from 'socket.io';
import { RoomCodeVO } from '../vo/room-code.vo';

export class Room {
  private readonly _code: RoomCodeVO;
  private readonly _videoId: string;
  private readonly _host: Socket;
  private readonly _clients: Set<Socket> = new Set();
  private readonly _createdAt: Date;

  private _currentTime: number = 0; // 초 단위
  private _isPlaying: boolean = false;
  private _lastUpdateTime: Date = new Date();

  constructor(
    code: RoomCodeVO,
    host: Socket,
    videoId: string,
    currentTime: number,
    isPlaying: boolean = false,
  ) {
    this._code = code;
    this._host = host;
    this._videoId = videoId;
    this._createdAt = new Date();
    this._currentTime = currentTime;
    this._isPlaying = isPlaying;
    this._lastUpdateTime = new Date();
  }

  get currentTime(): number {
    if (!this._isPlaying) return this._currentTime;
    const elapsed = (Date.now() - this._lastUpdateTime.getTime()) / 1000;
    return this._currentTime + elapsed;
  }

  get isPlaying(): boolean {
    return this._isPlaying;
  }

  get lastUpdateTime(): Date {
    return this._lastUpdateTime;
  }

  play(time: number) {
    this._currentTime = time;
    this._isPlaying = true;
    this._lastUpdateTime = new Date();
  }

  pause(time: number) {
    this._currentTime = time;
    this._isPlaying = false;
    this._lastUpdateTime = new Date();
  }

  seek(time: number) {
    this._currentTime = time;
    this._lastUpdateTime = new Date();
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

  get videoId(): string {
    return this._videoId;
  }

  url(): string {
    console.log(this._currentTime);
    console.log(this.currentTime);
    const time = Math.floor(this.currentTime);
    return `https://www.youtube.com/watch?v=${this._videoId}${time > 0 ? `&t=${time}s` : ''}`;
  }
}
