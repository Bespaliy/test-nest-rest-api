import {
  ArgumentMetadata,
  Injectable,
  PipeTransform,
  ForbiddenException
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Injectable()
export class ValidationPipe implements PipeTransform {
  async transform(value: CreateUserDto, metadata: ArgumentMetadata) {
    const obj = plainToClass(metadata.metatype, value);
    const errors = await validate(obj);
    if (errors.length) {
      const messages = errors.map((error) => {
        return `${error.property} - ${Object.values(error.constraints).join(
          ', ',
        )}`;
      });
      throw new ForbiddenException(messages);
    }
    return value;
  }
}
