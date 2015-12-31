import bunyan from 'bunyan';
import config from './';

export default bunyan.createLogger({name: config.WU_APP_NAME});