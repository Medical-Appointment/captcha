import { createClient } from 'redis';
const redisClient = createClient({
  url: 'redis://:tplentiful857@tplentiful.bio:9736',
});
redisClient.on('error', (err) => {
  console.log('【redis error】: ', err);
});
export { redisClient };
