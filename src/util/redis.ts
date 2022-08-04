import { createClient } from 'redis';
const client = createClient({
  url: 'redis://:donphds2990@tplentiful.bio:9736',
});
client.on('error', (err) => {
  console.log('【redis error】: ', err);
});

const redisClient = (function () {
  if (!client.isOpen) {
    client.connect();
  }
  return client;
})();

export { redisClient };
