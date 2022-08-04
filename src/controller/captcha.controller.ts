import {
  Controller,
  Get,
  UseInterceptors,
  UploadedFiles,
  Post,
  Body,
  Res,
  Query,
  Param,
} from '@nestjs/common';
import R from '../util/res';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CaptchaService } from '../svc/captcha.service';
import { CaptchaModel, CaptchaVo } from 'src/class/CaptchaRes';
import { download, remove, upload } from 'src/util/fdfs';
import { redisClient } from 'src/util/redis';
import { Response } from 'express';
import { json } from 'stream/consumers';
import { CaptchaNotFoundException } from 'src/helper/Exceptions';
const TEMPLATE = 'templates';
const CAPTCHA_PREFIX = 'captcha:';
@Controller('/captcha')
export class CaptchaController {
  constructor(private readonly captchaService: CaptchaService) {}

  @Post('/storage')
  @UseInterceptors(FilesInterceptor('files', 10))
  async storageCaptcha(
    @Res() res: Response,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() body: CaptchaModel,
  ) {
    if (files == null || files.length == 0) {
      return R.err4('file be must');
    }
    if (!redisClient.isOpen) {
      redisClient.connect();
    }
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
      }
    }
    await redisClient.HSET(
      `captcha:${body.captchaId}`,
      TEMPLATE,
      JSON.stringify(arr),
    );
    res.json(R.ok2(null));
  }

  @Get('/load')
  async loadCaptcha(@Query() params: CaptchaModel): Promise<CaptchaVo> {
    // 当前是用户指定的图集，会存在 Redis 中，供 node 服务获取
    const templates = await redisClient.HGET(
      CAPTCHA_PREFIX + params.captchaId,
      TEMPLATE,
    );
    const resources: Array<string> = JSON.parse(templates);
    if (resources == null || resources.length == 0) {
      throw new CaptchaNotFoundException(params.captchaId);
    }
    const path = resources[Math.round(Math.random() * resources.length - 1)];
    console.log(path);

    return await this.captchaService.getCaptcha(await download(path));
  }

  @Post("/verify")
  async verify() {
    
  }
 
  @Get('/finish')
  async finish(@Query('path') path: string) {
    console.log(path);
    console.log(await remove(path));
  }
}
