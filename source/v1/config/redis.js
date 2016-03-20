import redis from 'redis';
import bluebird from 'bluebird';
import config from './';

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

export default {
    createClient() {
        if(!this.redisClient) {
            this.redisClient = redis.createClient({
                host: config.WU_REDIS_HOST,
                port: config.WU_REDIS_PORT,
                password: config.WU_REDIS_PASSWORD
            });
        }
        return this.redisClient;
    },
    createSubClient() {
        if(!this.redisSubClient) {
            this.redisSubClient = redis.createClient({
                host: config.WU_REDIS_HOST,
                port: config.WU_REDIS_PORT,
                password: config.WU_REDIS_PASSWORD,
                return_buffers: true
            });
        }
        return this.redisSubClient;
    }
};

