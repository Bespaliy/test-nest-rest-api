import { IsString, Length } from 'class-validator';
import { IsEmailOrPhone } from './IsEmailOrPhone';

export class CreateUserDto {
  @IsString({ message: 'Must be a string' })
  @IsEmailOrPhone('id', { message: 'Must be a email or phone number' })
  readonly id: string;

  @IsString({ message: 'Must be a string' })
  @Length(8, 30, { message: 'Password must be 8 in len' })
  readonly password: string;
}
