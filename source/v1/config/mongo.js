import mongoose from 'mongoose';
import config from '../config';
import bluebird from 'bluebird';

mongoose.Promise = bluebird;

export default mongoose.connect(config.WU_MONGO);