FROM node:18.12.1

WORKDIR /app

COPY package.json /app/
COPY yarn.lock /app/

RUN yarn --frozen-lockfile


COPY prisma /app/prisma
COPY .env /app/

RUN yarn prisma db push


COPY . /app/

RUN yarn build

CMD ["yarn", "start"]
