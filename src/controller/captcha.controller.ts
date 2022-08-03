import {
  Controller,
  Get,
  UseInterceptors,
  UploadedFile,
  StreamableFile,
  UploadedFiles,
  Param,
  Post,
  Body,
  Res,
  Query,
} from '@nestjs/common';
import R from '../util/res';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CaptchaService } from '../svc/captcha.service';
import { CaptchaModel } from 'src/types/CaptchaRes';
import { remove, upload } from 'src/util/fdfs';
import { file } from 'jszip';
import { redisClient } from 'src/util/redis';
import { Response } from 'express';
import { validate } from 'uuid';

@Controller('/captcha')
export class CaptchaController {
  constructor(private readonly captchaService: CaptchaService) {}

  @Post('/storage')
  @UseInterceptors(FilesInterceptor('file'))
  async storageCaptcha(
    @Res() res: Response,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body(validate()) body: CaptchaModel,
  ): Promise<R> {
    if (files == null || files.length == 0) {
      return R.err4('file be must');
    }
    await redisClient.connect();
    const arr = new Array<string>();
    for (const file of files) {
      const path = await upload(file.buffer);
      if (path) {
        arr.push(path);
      } else {
        arr.forEach(async (p) => {
          await remove(p);
        });
        res.statusMessage = 'file upload error';
        res.statusCode = 500;
        res.send();
      }
    }
    redisClient.HSET(
      `captcha:${body.captchaId}`,
      'templates',
      JSON.stringify(arr),
    );
    return R.ok2('');
  }

  @Get('/finish')
  async finish(@Query('path') path: string) {
    console.log(path);

    console.log(await remove(path));
  }
}
