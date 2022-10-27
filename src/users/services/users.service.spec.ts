import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import entities, { User } from '../../typeorm';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let moduleRef: TestingModule;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [UsersService],
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: 'localhost',
          port: 5432,
          username: 'postgres',
          password: 'admin',
          database: 'testdb',
          entities: entities,
          synchronize: true,
        }),
        TypeOrmModule.forFeature([User]),
      ],
    }).compile();
    service = moduleRef.get<UsersService>(UsersService);
  });

  afterAll(async () => {
    await service.deleteAllUsers();
    await moduleRef.close();
  });

  const testUser1 = { id: 'test@gmail.com', password: 'testpassword' };
  const testUser2 = { id: '+380993181478', password: 'testpassword' };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('createUser: should return new user with field id_type', async () => {
    const newUser = await service.createUser(testUser1);
    expect(newUser).toEqual({
      id: 'test@gmail.com',
      password: 'testpassword',
      id_type: 'email',
    });
  });

  it('findUserById: should return user find by id', async () => {
    const user = await service.findUserById(testUser1.id);
    expect(user).toEqual({
      id: 'test@gmail.com',
      password: 'testpassword',
      id_type: 'email',
    });
  });

  it('findUserById: should return user with only id_type field', async () => {
    const user = await service.findUserById(testUser1.id, ['id_type']);
    expect(user).toEqual({ id_type: 'email' });
  });

  it('deleteUserById: should delete user', async () => {
    await service.deleteUserById(testUser1.id);
    const notExistUser = await service.findUserById(testUser1.id);
    expect(notExistUser).toBeNull();
  });

  it('deleteAllUsers: should delete all users', async () => {
    const newUser1 = await service.createUser(testUser1);
    const newUser2 = await service.createUser(testUser2);
    await service.deleteAllUsers();
    const notExistUser1 = await service.findUserById(newUser1.id);
    const notExistUser2 = await service.findUserById(newUser2.id);
    expect(notExistUser1).toBeNull();
    expect(notExistUser2).toBeNull();
  });
});
