import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLE } from '../const';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private redisService: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const role = this.reflector.get<ROLE>('role', context.getHandler());
    if (role === ROLE.VISITOR || !role) {
      // 无权限要求
      return true;
    } else if (role === ROLE.NORMAL) {
      const token = context.switchToHttp().getRequest().headers['token'];
      const userid = await this.redisService.checkToken(token);
      if (userid) {
        const request = context.switchToHttp().getRequest();
        request.userid = userid;
        return true;
      } else {
        return false;
      }
    } else {
      const token = context.switchToHttp().getRequest().headers['token'];
      const userid = await this.redisService.checkToken(token);
      const request = context.switchToHttp().getRequest();
      request.userid = userid;
      return false;
    }
  }
}
