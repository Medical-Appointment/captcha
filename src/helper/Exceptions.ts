import { HttpException, HttpStatus } from '@nestjs/common';

export class CaptchaNotFoundException extends HttpException {
  constructor(captchaId: string) {
    super(
      `captcha atlas not fount【captcha_id: ${captchaId}】`,
      HttpStatus.NOT_FOUND,
    );
  }
}
