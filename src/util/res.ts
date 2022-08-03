export default class R {
  constructor(code: number, msg?: string, data?: any) {
    if (this.data == null) {
      this.data = Object.create(null);
    }
    if (data instanceof Map) {
      data.forEach((v, k) => {
        this.data[k] = v;
      });
    } else {
      this.data = data;
    }
    this.code = code;
    this.msg = msg;
  }
  data: any;
  code: number;
  msg: string;
  static ok(code: number, msg?: string, data?: Map<string, any>): R {
    return new R(code, msg, data);
  }
  static err(code: number, msg: string, data?: Map<string, any>): R {
    return new R(code, msg, data);
  }
  static ok2(msg?: string, data?: Map<string, any>): R {
    return R.ok(200, msg, data);
  }
  static err4(msg: string, data?: Map<string, any>): R {
    return R.err(400, msg, data);
  }
  static err5(msg: string, data?: Map<string, any>): R {
    return R.err(500, msg, data);
  }
}

type RData = {
  k: string;
  v: any;
};
