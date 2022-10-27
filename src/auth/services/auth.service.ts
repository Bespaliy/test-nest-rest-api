import {
  Injectable,
  Inject,
  CACHE_MANAGER,
  HttpException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Cache } from 'cache-manager';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import { UsersService } from '../../users/services/users.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async singup(dto: CreateUserDto) {
    const hashPassword = await bcrypt.hash(dto.password, 5);
    const user = await this.usersService.createUser({
      ...dto,
      password: hashPassword,
    });
    return await this.generateToken(user.id);
  }

  async singin(dto: CreateUserDto) {
    const user = await this.usersService.findUserById(dto.id);
    if (!user) throw new HttpException({ message: 'Not Found' }, 404);
    
    const isExist = await bcrypt.compare(dto.password, user.password);
    if (!isExist) throw new HttpException({ message: 'Unauthorized' }, 401);
    
    return await this.generateToken(user.id);
  }

  async logout(all: string, auth?: string) {
    const param = all === 'true' ? true : false;
    if (param) {
      await this.cacheManager.reset();
    } else {
      const token = auth.split(' ')[1];
      await this.cacheManager.del(`br_${token}`);
    }
  }

  async generateToken(id: string) {
    const access_token = this.jwtService.sign({ id });
    await this.cacheManager.set(`br_${access_token}`, access_token);
    return {
      access_token,
    };
  }

  async getIdFromToken(auth: string) {
    const token = auth.split(' ')[1];
    return this.jwtService.decode(token, { json: true }) as { id: string };
  }
}
