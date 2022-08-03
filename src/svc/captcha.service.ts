import { Injectable } from '@nestjs/common';
import { loadImage, createCanvas, Canvas } from 'canvas';
import { SliderProperties } from 'src/types/SliderProperties';
import CaptchaStream from 'src/class/CaptchaStream';
import { v4 } from 'uuid';
import { remove, upload } from 'src/util/fdfs';
import { CaptchaVo } from 'src/types/CaptchaRes';

const w = 50;
const h = 50;
const r = 8;
const radius = 5;
const padding = 7;
const illegalArr = [0, 1, 2, 4, 7, 15];

@Injectable()
export class CaptchaService {
  async getCaptcha(buffer: Buffer): Promise<CaptchaVo> {
    const sliderCanvas = createCanvas(80, 80);
    const bgCanvas = createCanvas(300, 200);
    const stream = await loadImageFromRequest(buffer, sliderCanvas, bgCanvas);
    const bgPath = await upload(stream.bg);
    const sliderPath = await upload(stream.slider);
    return {
      bg: bgPath,
      slice: sliderPath,
      lotNumber: v4(),
      payload: 'some encryptor data',
      ypos: stream.y - padding - r,
      feedback: '',
      processToken: v4(),
      captchaType: 'slider',
    };
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
  ctx.shadowColor = 'rgba(0, 0, 0, 1)';
  ctx.shadowBlur = 7;
  ctx.shadowOffsetX = 4;
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
  console.log(x, y);
  return new CaptchaStream(sliderCanvas.toBuffer(), bgCanvas.toBuffer(), x, y);
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
