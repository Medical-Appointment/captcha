import {
  Controller,
  Get,
  Header,
  Res,
  UseInterceptors,
  UploadedFiles,
  StreamableFile,
  Param,
  Post,
} from '@nestjs/common';
import R from '../util/res';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { CaptchaService } from '../svc/captcha.service';
import { file } from '@babel/types';

@Controller('/captcha')
export class CaptchaController {
  constructor(private readonly captchaService: CaptchaService) {}

  @Post('/generate')
  @UseInterceptors(FilesInterceptor('files'))
  generateCaptcha(@UploadedFiles() files: Array<Express.Multer.File>): R {
    if (files == null || files.length == 0) {
      return R.err4('files be must');
    }
    const data = new Map<string, any>();
    for (let file of files) {
      data.set(file.originalname, this.captchaService.getCaptcha(file.buffer));
    }
    return R.ok2('', data);
  }

  @Get('/slider/:uuid')
  async getSlider(@Param('uuid') key: string): Promise<StreamableFile> {
    return this.captchaService.getSlider(key).then((r) => {
      return new StreamableFile(r);
    });
  }
  @Get('/bg/:uuid')
  async getBg(@Param('uuid') key: string): Promise<StreamableFile> {
    return this.captchaService.getBg(key).then((r) => {
      return new StreamableFile(r);
    });
  }
}
