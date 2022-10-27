import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Headers,
  UsePipes,
  UseGuards,
} from '@nestjs/common';
import { AccessTokenGuard } from '../../guards/accessToken.guard';
import { ValidationPipe } from '../../pipes/validation.pipe';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import { AuthService } from '../services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UsePipes(ValidationPipe)
  @Post('singup')
  singup(@Body() dto: CreateUserDto) {
    return this.authService.singup(dto);
  }

  @UsePipes(ValidationPipe)
  @Post('singin')
  singin(@Body() dto: CreateUserDto) {
    return this.authService.singin(dto);
  }

  @UseGuards(AccessTokenGuard)
  @Get('logout/:all')
  logout(@Headers('Authorization') auth: string, @Param('all') all: string) {
    return this.authService.logout(all, auth);
  }
}
