import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../../auth/services/auth.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UsersService } from '../services/users.service';
import { AccessTokenGuard } from '../../guards/accessToken.guard';
import { RefreshTokenGuard } from '../../guards/refreshToken.guard';

@Controller('users')
export class UsersController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Get()
  getAllUsers() {
    return this.usersService.getAllUsers();
  }

  @Get('id/:id')
  findUserById(@Param('id') id: string) {
    return this.usersService.findUserById(id);
  }

  @UseGuards(AccessTokenGuard)
  @UseGuards(RefreshTokenGuard)
  @Post('create')
  createUser(@Body() dto: CreateUserDto) {
    return this.usersService.createUser(dto);
  }

  @UseGuards(AccessTokenGuard)
  @UseGuards(RefreshTokenGuard)
  @Delete('delete/:id')
  deleteUserById(@Param('id') id: string) {
    this.usersService.deleteUserById(id);
    return 'deleted';
  }

  @UseGuards(AccessTokenGuard)
  @UseGuards(RefreshTokenGuard)
  @Delete('delete')
  deleteAllUsers() {
    this.usersService.deleteAllUsers();
    return 'deleted';
  }

  @UseGuards(AccessTokenGuard)
  @UseGuards(RefreshTokenGuard)
  @Put('edit/:id')
  editUser(@Param('id') id: string, @Body() dto: CreateUserDto) {
    return this.usersService.editUser(id, dto);
  }

  @UseGuards(AccessTokenGuard)
  @UseGuards(RefreshTokenGuard)
  @Get('info')
  async getInfo(@Headers('Authorization') auth: string) {
    const { id } = await this.authService.getIdFromToken(auth);
    return this.usersService.findUserById(id, ['id', 'id_type']);
  }
}
