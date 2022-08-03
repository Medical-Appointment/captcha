import { Injectable } from '@nestjs/common';
import { Readable } from 'stream';
import {
  Image,
  CanvasRenderingContext2D,
  loadImage,
  createCanvas,
  PNGStream,
  Canvas,
  createImageData,
} from 'canvas';
import { v4 as uuidv4 } from 'uuid';
type SliderProperties = {
  x: number;
  y: number;
  w: number;
  h: number;
  r: number;
  radius?: number;
};
class CaptchaStream {
  constructor(slider: Readable, bg: Readable) {
    this.bg = bg;
    this.slider = slider;
  }
  slider: Readable;
  bg: Readable;
}
const w = 50;
const h = 50;
const r = 8;
const radius = 5;
const padding = 7;
const illegalArr = [0, 1, 2, 4, 7, 15];
const CAPTCHA_MAP = new Map<string, Promise<CaptchaStream>>();

@Injectable()
export class CaptchaService {
  getCaptcha(buffer: Buffer): string {
    const sliderCanvas = createCanvas(80, 80);
    const bgCanvas = createCanvas(300, 200);
    const key = uuidv4();
    CAPTCHA_MAP.set(key, loadImageFromRequest(buffer, sliderCanvas, bgCanvas));
    return key;
  }

  async getSlider(uuid: string): Promise<PNGStream> {
    const rr = await CAPTCHA_MAP.get(uuid)
    return rr.slider;
  }
  async getBg(uuid: string): Promise<PNGStream> {
    return (await CAPTCHA_MAP.get(uuid)).bg;
  }
}

async function loadImageFromRequest(
  param: string | Buffer,
  sliderCanvas: Canvas,
  bgCanvas: Canvas,
): Promise<CaptchaStream> {
  if (typeof param == 'string' && !param.startsWith('http', 0)) {
    return;
  }
  const img = await loadImage(param);
  const slider = sliderCanvas.getContext('2d');
  const bg = bgCanvas.getContext('2d');
  const tmpCanvas = createCanvas(300, 200);
  const tmp = tmpCanvas.getContext('2d');
  const strategy = getStrategy();
  let sliderContext = getCaptcha(
    { x: padding + r, y: padding + r, w, h, r, radius },
    strategy,
  );
  let ctx = sliderContext.getContext('2d');
  // draw slider
  ctx.fillStyle = `rgba(0, 0, 0, 1)`;
  ctx.strokeStyle = `rgba(255, 255, 255, 1)`;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fill();
  tmp.drawImage(img, 0, 0, 300, 200);
  tmp.globalCompositeOperation = 'destination-atop';
  const x = Math.random() * 220;
  const y = Math.random() * 120;
  tmp.drawImage(sliderContext, x, y);
  ctx.shadowColor = 'rgba(0, 0, 0, .6)';
  ctx.shadowBlur = 5;
  ctx.shadowOffsetX = 2;
  ctx.fill();
  tmp.drawImage(sliderContext, x, y);
  slider.drawImage(tmpCanvas, -x, -y);
  bg.drawImage(img, 0, 0, 300, 200);
  bg.globalCompositeOperation = 'source-over';
  sliderContext = getCaptcha(
    { x: padding + r, y: padding + r, w, h, r, radius },
    strategy,
  );
  ctx = sliderContext.getContext('2d');
  ctx.strokeStyle = `rgba(0, 0, 0, 0.25)`;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = `rgba(0, 0, 0, 0.5)`;
  ctx.fill();
  bg.drawImage(sliderContext, x, y);
  return new CaptchaStream(
    sliderCanvas.createPNGStream(),
    bgCanvas.createPNGStream(),
  );
}

function getCaptcha(p: SliderProperties, strategy: boolean[]) {
  const { x, y, w, h, r, radius } = p;
  const cap = createCanvas(81, 81);
  cap.width = 81;
  cap.height = 81;
  const ctx = cap.getContext('2d');
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + radius, y, x + w / 2 - r, y, radius);
  if (strategy[0] != null) {
    ctx.arc(x + w / 2, y, r, Math.PI, 0, strategy[0]);
  }
  ctx.arcTo(x + w, y, x + w, y + h / 2 - r, radius);
  if (strategy[1] != null) {
    ctx.arc(x + w, y + h / 2, r, -Math.PI / 2, Math.PI / 2, strategy[1]);
  }
  ctx.arcTo(x + w, y + h, x + w / 2 + r, y + h, radius);
  if (strategy[2] != null) {
    ctx.arc(x + w / 2, y + h, r, 0, Math.PI, strategy[2]);
  }
  ctx.arcTo(x, y + h, x, y + h / 2 + r, radius);
  if (strategy[3] != null) {
    ctx.arc(x, y + h / 2, r, Math.PI / 2, Math.PI / 2 + Math.PI, strategy[3]);
  }
  ctx.arcTo(x, y, x + radius, y, radius);

  return cap;
}

// 统一 true 内凹
// 上 画法为          bg.arc(x + w / 2, y, 10, Math.PI, 0, true)
// 右 画法为          bg.arc(x + w, y + h / 2, r, -Math.PI / 2, Math.PI / 2, true)
// 下 画法为          bg.arc(x + w / 2, y + h, r, 0, Math.PI, true)
// 左 画法为          bg.arc(x, y + h / 2, r, Math.PI / 2, Math.PI / 2 + Math.PI, true)

function getStrategy() {
  let randEdge = Math.floor(Math.random() * 1024) & 0x0f;
  while (illegalArr.indexOf(randEdge) !== -1) {
    randEdge = Math.floor(Math.random() * 1024) & 0x0f;
  }
  let pos = 0;
  const strategy = [];
  let randEdgeBit = randEdge.toString(2);
  while (randEdgeBit.length < 4) {
    randEdgeBit = '0' + randEdgeBit;
  }
  for (let i = 0; i < randEdgeBit.length; i++) {
    if (randEdgeBit.charAt(i) === '1') {
      let tt = Math.floor(Math.random() * 2 + 1);
      while (tt === 3) {
        tt = Math.floor(Math.random() * 2 + 1);
      }
      switch (tt) {
        case 1:
          strategy[pos] = false;
          break;
        case 2:
          strategy[pos] = true;
          break;
      }
    } else {
      strategy[pos] = null;
    }
    pos++;
  }
  return strategy;
}
