import { forwardRef, Module } from '@nestjs/common';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AccessTokenStrategy } from '../strategies/accessToken.strategy';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/services/auth.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret: 'SECRET',
    }),
    forwardRef(() => AuthModule),
  ],
  controllers: [UsersController],
  providers: [UsersService, AuthService, AccessTokenStrategy],
  exports: [UsersService],
})
export class UsersModule {}
