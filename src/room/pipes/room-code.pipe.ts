import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { RoomCodeVO } from '../vo/room-code.vo';

@Injectable()
export class RoomCodePipe implements PipeTransform<string, RoomCodeVO> {
  transform(value: string, metadata: ArgumentMetadata): RoomCodeVO {
    try {
      return new RoomCodeVO(value);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
