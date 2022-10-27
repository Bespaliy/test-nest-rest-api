import {
  registerDecorator,
  ValidationOptions,
  isPhoneNumber,
  isEmail,
} from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export const IsEmailOrPhone = (
  property: string,
  validationOptions?: ValidationOptions,
) => {
  return (object: CreateUserDto, propertyName: string) => {
    registerDecorator({
      name: 'IsEmailOrPhone',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: string) {
          return isPhoneNumber(value, 'UA') || isEmail(value);
        },
      },
    });
  };
};
