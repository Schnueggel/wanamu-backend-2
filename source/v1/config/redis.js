import redis from 'redis';
import bluebird from 'bluebird';
import config from './';

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

export default {
    redis,
    createClient() {
        if(!this.client) {
            this.client = redis.createClient({
                host: config.WU_REDIS_HOST
            });
        }
        return this.client;
    }
};

