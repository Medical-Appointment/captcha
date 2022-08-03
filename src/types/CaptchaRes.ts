type CaptchaModel = {
  captchaId: string;
  clientId: string;
  challenge: string;
  captchaType: string;
  lotNumber: string;
  feedback: string;
  processToken: string;
  states: string;
  payload: string;
};

type CaptchaVo = {
  captchaType: string;
  lotNumber: string;
  feedback: string;
  processToken: string;
  payload: string;
  bg: string;
  slice: string;
  ypos: number;
};

export { CaptchaModel, CaptchaVo };
