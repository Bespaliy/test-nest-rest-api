import { CacheModule, CACHE_MANAGER, forwardRef, INestApplication } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import entities, { User } from '../src/typeorm';
import { UsersModule } from '../src/users/users.module';
import { AuthService } from '../src/auth/services/auth.service';
import { Cache } from 'cache-manager';
import * as request from 'supertest';
import { UsersService } from '../src/users/services/users.service';

describe('AuthController', () => {
  let service: AuthService;
  let usersService: UsersService;
  let moduleRef: TestingModule;
  let cacheService: Cache;
  let app: INestApplication;
  
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
    usersService = moduleRef.get<UsersService>(UsersService);
    cacheService = moduleRef.get<Cache>(CACHE_MANAGER);
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await usersService.deleteAllUsers();
    await moduleRef.close();
  });

  const notExisttestUser = { id: 'not@gmail.com', password: 'notexistpass' };
  const testUser1 = { id: 'besad@gmail.com', password: 'testpassword' };
  const testUser2 = { id: '+380993181478', password: 'testpassword' };
  const inccorectTestUser1 = { id: '+3809sd181478', password: 'testpassword' };
  const inccorectTestUser2 = { id: 'testil.com', password: 'testpassword' };
  const inccorectTestUser3 = { id: '+', password: 'tes' };

  it('singup: create a user and return access_token', () => {
    return request(app.getHttpServer())
      .post('/auth/singup')
      .set('Content-type', 'application/json')
      .send(testUser2)
      .expect(201)
      .then(res => {
        expect(res.body).toHaveProperty('access_token')
      })
  });

  it('singin: return access_token', () => {
    return request(app.getHttpServer())
      .post('/auth/singin')
      .set('Content-type', 'application/json')
      .send(testUser2)
      .expect(201)
      .then(res => {
        expect(res.body).toHaveProperty('access_token')
      })
  });

  it('singin: logged in an non exist user', () => {
    return request(app.getHttpServer())
      .post('/auth/singin')
      .set('Content-type', 'application/json')
      .send(notExisttestUser)
      .expect(404)
      .expect('{"message":"Not Found"}')
  });

  it('logout: remove current user token', async () => {
    const data1 = await service.singup(testUser1);
    const data2 = await service.singup(testUser2);
    return request(app.getHttpServer())
      .get('/auth/logout/false')
      .set('Authorization', `Bearer ${data1.access_token}`)
      .expect(200)
      .then(async () => {
        expect(await cacheService.get(`br_${data1.access_token}`)).toBeUndefined();
        expect(await cacheService.get(`br_${data2.access_token}`)).toBe(data2.access_token);
      })
  });

  it('logout: return 401 error when user not logged in ', async () => {
    return request(app.getHttpServer())
      .get('/auth/logout/false')
      .set('Authorization', `Bearer smth`)
      .expect(401)
      .expect('{"statusCode":401,"message":"Unauthorized"}')
  });

  it('logout: remove all users token', async () => {
    const data1 = await service.singup(testUser1);
    const data2 = await service.singup(testUser2);
    return request(app.getHttpServer())
      .get('/auth/logout/true')
      .set('Authorization', `Bearer ${data1.access_token}`)
      .expect(200)
      .then(async () => {
        expect(await cacheService.get(`br_${data1.access_token}`)).toBeUndefined();
        expect(await cacheService.get(`br_${data2.access_token}`)).toBeUndefined();
      })
  });

  it('singup: validate user if inccorect phone', () => {
    return request(app.getHttpServer())
      .post('/auth/singup')
      .set('Content-type', 'application/json')
      .send(inccorectTestUser1)
      .expect(403)
      .expect(`{
        "statusCode":403,
        "message":["id - Must be a email or phone number"],
        "error":"Forbidden"
      }`.split('\n').map(str => str.trim()).join(''));
  });

  it('singup: validate user if inccorect phone', () => {
    return request(app.getHttpServer())
      .post('/auth/singup')
      .set('Content-type', 'application/json')
      .send(inccorectTestUser2)
      .expect(403)
      .expect(`{
          "statusCode":403,
          "message":["id - Must be a email or phone number"],
          "error":"Forbidden"
        }`.split('\n').map(str => str.trim()).join(''));
  });

  it('singup: validate user if inccorect phone', () => {
    return request(app.getHttpServer())
      .post('/auth/singup')
      .set('Content-type', 'application/json')
      .send(inccorectTestUser3)
      .expect(403)
      .expect(`{
            "statusCode":403,
            "message":["id - Must be a email or phone number","password - Password must be 8 in len"],
            "error":"Forbidden"
          }`.split('\n').map(str => str.trim()).join(''));
  });

  it('singin: validate user if inccorect phone', () => {
    return request(app.getHttpServer())
      .post('/auth/singin')
      .set('Content-type', 'application/json')
      .send(inccorectTestUser1)
      .expect(403)
      .expect(`{
        "statusCode":403,
        "message":["id - Must be a email or phone number"],
        "error":"Forbidden"
      }`.split('\n').map(str => str.trim()).join(''));
  });

  it('singin: validate user if inccorect phone', () => {
    return request(app.getHttpServer())
      .post('/auth/singin')
      .set('Content-type', 'application/json')
      .send(inccorectTestUser2)
      .expect(403)
      .expect(`{
          "statusCode":403,
          "message":["id - Must be a email or phone number"],
          "error":"Forbidden"
        }`.split('\n').map(str => str.trim()).join(''));
  });

  it('singin: validate user if inccorect phone', () => {
    return request(app.getHttpServer())
      .post('/auth/singin')
      .set('Content-type', 'application/json')
      .send(inccorectTestUser3)
      .expect(403)
      .expect(`{
            "statusCode":403,
            "message":["id - Must be a email or phone number","password - Password must be 8 in len"],
            "error":"Forbidden"
          }`.split('\n').map(str => str.trim()).join(''));
  });
});

