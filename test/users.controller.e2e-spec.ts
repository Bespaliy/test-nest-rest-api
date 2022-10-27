import { CacheModule, forwardRef, INestApplication } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import entities, { User } from '../src/typeorm';
import * as request from 'supertest';
import { AuthModule } from '../src/auth/auth.module';
import { UsersService } from '../src/users/services/users.service';
import { AuthService } from '../src/auth/services/auth.service';

describe('UsersController', () => {
  let service: AuthService;
  let moduleRef: TestingModule;
  let app: INestApplication;
  let usersService: UsersService;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        forwardRef(() => AuthModule),
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
      providers: [UsersService, AuthService],
    }).compile();

    usersService = moduleRef.get<UsersService>(UsersService);
    service = moduleRef.get<AuthService>(AuthService);
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await usersService.deleteAllUsers();
    await moduleRef.close();
  });

  const testUser1 = { id: 'testtest@gmail.com', password: 'testtest' };

  it('info: return an information about user in format { id: string, id_type: string }', async () => {
    const { access_token } = await service.singup(testUser1);
    return request(app.getHttpServer())
      .get('/users/info')
      .set('Content-type', 'application/json')
      .set('Authorization', `Bearer ${access_token}`)
      .expect(200)
      .then(res => {
        expect(res.body).toHaveProperty('id')
        expect(res.body).toHaveProperty('id_type')
        expect(res.body).toEqual({ id: 'testtest@gmail.com', id_type: 'email' })
      })
  });

  it('info: return 401 if user not logged in', async () => {
    return request(app.getHttpServer())
      .get('/users/info')
      .set('Content-type', 'application/json')
      .set('Authorization', `Bearer smth`)
      .expect(401)
      .expect('{"message":"Unauthorized"}')
  });
});

