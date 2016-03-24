FROM node:5.8.0
ADD ./dist /wanamu-backend-2/dist
ADD ./package.json /wanamu-backend-2
WORKDIR /wanamu-backend-2
RUN npm install --production
ENV WU_REDIS_HOST=$REDIS_PORT_6379_TCP_ADDR
ENV WU_MONGO_HOST=$MONGO_PORT_27017_TCP_ADDR
CMD npm run start && npm run pm-log