import { IsNotEmpty } from 'class-validator';
class CaptchaModel {
  @IsNotEmpty({ message: 'captcha_id can`t be empty' })
  captchaId: string;
  @IsNotEmpty({ message: 'client_id can`t be empty' })
  clientId: string;
  challenge: string | null;
  @IsNotEmpty({ message: 'lot_number can`t be empty' })
  lotNumber: string;
  states: string | null;
  payload: string | null;
}

class CaptchaVo {
  captchaType: string;
  lotNumber: string;
  feedback: string;
  processToken: string;
  payload: string;
  bg: string;
  slice: string;
  ypos: number;
}

export { CaptchaModel, CaptchaVo };
