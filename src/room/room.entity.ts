import { RoomCodeVO } from './vo/room-code.vo';

export class Room {
  private readonly _code: RoomCodeVO;
  private readonly createdAt: Date;

  constructor(code: RoomCodeVO) {
    this._code = code;
    this.createdAt = new Date();
  }

  get code(): RoomCodeVO {
    return this._code;
  }
}
