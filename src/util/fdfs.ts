const FdfsClient = require('fdfs');
var debug = require('debug')('fdfs');
import { parse } from 'url';
const client = new FdfsClient({
  trackers: [
    {
      host: '47.96.5.71',
      port: 22122,
    },
  ],
  logger: {
    log: debug,
  },
});
const upload = async (data: Buffer, ext: string = 'png'): Promise<string> => {
  const res = await client.upload(data, {
    ext,
  });
  if (typeof res == 'string') {
    return res;
  }
  console.log(res);
};

const remove = async (path: string): Promise<boolean> => {
  if (path.startsWith('http')) {
    path = parse(path).pathname;
  }
  if (path.startsWith('/')) {
    path = path.substring(1);
  }
  const r = await client.del(path);
  if (r) {
    console.log(r);
    return false;
  }
  return true;
};
export { upload, remove };
