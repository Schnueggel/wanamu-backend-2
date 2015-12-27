import mongoose from 'mongoose';
import userService from '../services/user';
import notificationService from '../services/notification';
import * as _ from 'lodash';

export class NotificationController {

    /**
     * Socket route
     */
    register() {
        notificationService.register(this.request.user._id, this.id);
        this.emit('register', true);
    }

    /**
     * Socket route
     */
    unRegister() {
        notificationService.unRegister(this.id);
        this.emit('unRegister');
    }
}

export default new NotificationController();