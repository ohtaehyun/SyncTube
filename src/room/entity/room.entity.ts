import { Socket } from 'socket.io';
import { RoomCodeVO } from '../vo/room-code.vo';

export class Room {
  private readonly _code: RoomCodeVO;
  private _videoId: string;
  private readonly _host: Socket;
  private readonly _clients: Set<Socket> = new Set();
  private readonly _createdAt: Date;

  private _currentTime: number = 0; // 초 단위
  private _isPlaying: boolean = false;
  private _lastUpdateTime: Date = new Date();
  private _revision = 0;

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
    this._revision += 1;
  }

  pause(time: number) {
    this._currentTime = time;
    this._isPlaying = false;
    this._lastUpdateTime = new Date();
    this._revision += 1;
  }

  seek(time: number) {
    this._currentTime = time;
    this._lastUpdateTime = new Date();
    this._revision += 1;
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

  hasClient(client: Socket): boolean {
    return this._clients.has(client);
  }

  get clientCount(): number {
    return this._clients.size;
  }

  get hostId(): string {
    return this._host.id;
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

  playbackState() {
    return {
      code: this._code.value,
      isPlaying: this._isPlaying,
      anchorTime: this._currentTime,
      anchorTs: this._lastUpdateTime.getTime(),
      revision: this._revision,
    };
  }

  changeVideo(videoId: string, currentTime: number, isPlaying: boolean) {
    this._videoId = videoId;
    if (isPlaying) this.play(currentTime);
    else this.pause(currentTime);
  }

  url(): string {
    const time = Math.floor(this.currentTime);
    return `https://www.youtube.com/watch?v=${this._videoId}${time > 0 ? `&t=${time}s` : ''}`;
  }
}
