export default class CaptchaStream {
  constructor(slider: Buffer, bg: Buffer, x: number, y: number) {
    this.x = x;
    this.y = y;
    this.bg = bg;
    this.slider = slider;
  }
  x: number;
  y: number;
  slider: Buffer;
  bg: Buffer;
}
