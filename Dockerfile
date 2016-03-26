FROM node:5.8.0
ADD ./dist /wanamu-backend-2/dist
ADD ./package.json /wanamu-backend-2
WORKDIR /wanamu-backend-2
RUN npm install --production
EXPOSE 3000
CMD ["npm run start && npm run pm-log"]