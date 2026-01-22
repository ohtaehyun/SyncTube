import crypto from 'crypto';

export class RoomCodeVO {
  private static readonly ALPHABET = 'ABCDEFGHJKMNPQRSTVWXYZ23456789'; // I, L, O, 0, 1 제거
  private static readonly BASE = RoomCodeVO.ALPHABET.length;
  private static readonly CODE_LENGTH = 6;

  private readonly _value: string;

  get value(): string {
    return this._value;
  }

  constructor(value: string) {
    this.validate(value);
    this._value = value;
  }

  private validate(value: string): void {
    if (value.length !== RoomCodeVO.CODE_LENGTH) {
      throw new Error(`Room code must be ${RoomCodeVO.CODE_LENGTH} characters`);
    }

    if (![...value].every((char) => RoomCodeVO.ALPHABET.includes(char))) {
      throw new Error('Room code contains invalid characters');
    }
  }

  static generate(): RoomCodeVO {
    let out = '';
    while (out.length < RoomCodeVO.CODE_LENGTH) {
      const b = crypto.randomBytes(1)[0];
      const max = Math.floor(256 / RoomCodeVO.BASE) * RoomCodeVO.BASE;
      if (b >= max) continue;
      out += RoomCodeVO.ALPHABET[b % RoomCodeVO.BASE];
    }
    return new RoomCodeVO(out);
  }
}
