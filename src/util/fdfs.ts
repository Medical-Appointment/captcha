const FdfsClient = require('fdfs');
var debug = require('debug')('fdfs');
import { createReadStream } from 'fs';
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
const download = async (fileId: string): Promise<Buffer> => {
  const target = 'tmp.png'
  let stream = createReadStream(target)
  createReadStream
  await client.download(fileId,target);
  return new Promise<Buffer>((resolve, reject) => {
    let buffers = [];
    stream.on('error', reject);
    stream.on('data', (data) => {
      buffers.push(data);
    });
    stream.on('end', () => resolve(Buffer.concat(buffers)));
  })
    .then((r) => r)
    .catch((e) => {
      console.log(e);
      return Buffer.concat([]);
    });
};
export { upload, remove, download };
