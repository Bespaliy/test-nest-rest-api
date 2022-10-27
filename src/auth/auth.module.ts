import { forwardRef, Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    JwtModule.register({
      secret: 'SECRET',
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
