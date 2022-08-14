import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { User, Userwx, Userphone } from '../entity/users.entity';
import { RedisModule } from '../redis/redis.module';
import { WxhttpModule } from '../wxhttp/wxhttp.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Userwx, Userphone]),
    WxhttpModule,
    RedisModule,
  ],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
