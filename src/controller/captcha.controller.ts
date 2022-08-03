import {
  Controller,
  Get,
  UseInterceptors,
  UploadedFile,
  StreamableFile,
  Param,
  Post,
  Body,
  Res,
  Query,
} from '@nestjs/common';
import R from '../util/res';
import { FileInterceptor } from '@nestjs/platform-express';
import { CaptchaService } from '../svc/captcha.service';
import { CaptchaModel } from 'src/types/CaptchaRes';
import { remove } from 'src/util/fdfs';

@Controller('/captcha')
export class CaptchaController {
  constructor(private readonly captchaService: CaptchaService) {}

  @Post('/generate')
  @UseInterceptors(FileInterceptor('file'))
  async generateCaptcha(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CaptchaModel,
  ): Promise<R> {
    if (file == null) {
      return R.err4('file be must');
    }
    return R.ok2(
      '',
      new Map(
        Object.entries(await this.captchaService.getCaptcha(file.buffer)),
      ),
    );
  }

  @Get('/finish')
  finish(@Query('path') path: string) {
    console.log(remove(path));
  }
}
