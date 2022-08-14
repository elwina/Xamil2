import { Module } from '@nestjs/common';
import { WxhttpService } from './wxhttp.service';

@Module({
  providers: [WxhttpService],
  exports: [WxhttpService],
})
export class WxhttpModule {}
