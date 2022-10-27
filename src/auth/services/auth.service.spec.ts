import { CacheModule, CACHE_MANAGER, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import entities, { User } from '../../typeorm';
import { UsersModule } from '../../users/users.module';
import { AuthService } from './auth.service';
import { Cache } from 'cache-manager';
import { UsersService } from '../../users/services/users.service';

describe('AuthService', () => {
  let service: AuthService;
  let moduleRef: TestingModule;
  let cacheService: Cache;
  let usersService: UsersService;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        forwardRef(() => UsersModule),
        JwtModule.register({
          secret: 'SECRET',
        }),
        CacheModule.register({
          isGlobal: true,
          ttl: 60,
        }),
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
      providers: [AuthService, UsersService],
    }).compile();

    service = moduleRef.get<AuthService>(AuthService);
    cacheService = moduleRef.get<Cache>(CACHE_MANAGER);
    usersService = moduleRef.get<UsersService>(UsersService);
  });

  afterAll(async () => {
    await usersService.deleteAllUsers();
    await moduleRef.close();
  });

  const testUser1 = { id: 'test@gmail.com', password: 'testpassword' };
  const testUser2 = { id: '+380993181478', password: 'testpassword' };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('generateToken: should return access token', async () => {
    const access_test_token = await service.generateToken(testUser1.id);
    expect(access_test_token).toBeDefined();
  });

  it('getIdFromToken: should decoded accsess token and return id', async () => {
    const { access_token } = await service.generateToken(testUser1.id);
    const { id } = await service.getIdFromToken(`Bearer ${access_token}`);
    expect(id).toBe(testUser1.id);
  });

  it('generateToken: should be equal to token inside cache', async () => {
    const { access_token } = await service.generateToken(testUser1.id);
    const cacheToken = await cacheService.get(`br_${access_token}`);
    expect(access_token).toBe(cacheToken);
  });

  it('logout: should delete token from cache', async () => {
    const { access_token } = await service.generateToken(testUser1.id);
    await service.logout('false', `Bearer ${access_token}`);
    const deletedToken = await cacheService.get(`br_${access_token}`);
    expect(deletedToken).toBeUndefined();
  });

  it('logout: should delete all token', async () => {
    const token1 = await service.generateToken(testUser1.id);
    const token2 = await service.generateToken(testUser2.id);
    await service.logout('true');
    const deletedToken1 = await cacheService.get(`br_${token1.access_token}`);
    const deletedToken2 = await cacheService.get(`br_${token2.access_token}`);
    expect(deletedToken1).toBeUndefined();
    expect(deletedToken2).toBeUndefined();
  });

  it('singup: should return token', async () => {
    const { access_token } = await service.singup(testUser1);
    const newToken = await cacheService.get(`br_${access_token}`);
    expect(newToken).toBe(access_token);
  });

  it('singin: should return token', async () => {
    const { access_token } = await service.singin(testUser1);
    const newToken = await cacheService.get(`br_${access_token}`);
    expect(newToken).toBe(access_token);
  });
});
