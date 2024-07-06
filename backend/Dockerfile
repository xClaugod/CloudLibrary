FROM node:20-alpine
WORKDIR /app
COPY . .
COPY ./uploads ./uploads
COPY ./.env .env
RUN npm install
EXPOSE 8800
CMD ["npm", "start"]
