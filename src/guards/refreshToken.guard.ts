import {
  CACHE_MANAGER,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const req = context.switchToHttp().getRequest();
      const token = req.headers.authorization.split(' ')[1];
      const isExist = await this.cacheManager.get(`br_${token}`);
      if (!isExist) {
        throw new UnauthorizedException({ message: 'Unauthorized' });
      }
      await this.cacheManager.set(`br_${token}`, token);
      return true;
    } catch (e) {
      throw new UnauthorizedException({ message: 'Unauthorized' });
    }
  }
}
