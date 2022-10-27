import { Injectable } from '@nestjs/common';
import { User } from '../../typeorm';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

type SelectUser = keyof typeof User.prototype;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async getAllUsers() {
    const users = await this.userRepository.find();
    return users;
  }

  async findUserById(id: string, selectFields?: SelectUser[]) {
    const user = await this.userRepository.findOne({
      select: selectFields ?? [],
      where: { id },
    });
    return user;
  }

  async createUser(dto: CreateUserDto) {
    const id_type = dto.id.includes('@') ? 'email' : 'phone';
    const newUser = this.userRepository.create({ ...dto, id_type });
    return await this.userRepository.save(newUser);
  }

  async deleteUserById(id: string) {
    await this.userRepository.delete(id);
  }

  async deleteAllUsers() {
    await this.userRepository.clear();
  }

  async editUser(id: string, dto: CreateUserDto) {
    return await this.userRepository.update(id, dto);
  }
}
