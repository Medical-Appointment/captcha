import { Module } from '@nestjs/common';
import { CaptchaController } from './controller/captcha.controller';
import { CaptchaService } from './svc/captcha.service';

@Module({
  imports: [],
  controllers: [CaptchaController],
  providers: [CaptchaService],
})
export class AppModule {}
