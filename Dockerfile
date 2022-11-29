FROM node:hydrogen

WORKDIR /app

COPY package.json /app/
COPY yarn.lock /app/

RUN yarn --frozen-lockfile


COPY prisma /app/
COPY .env /app/

RUN yarn prisma db push


COPY . /app/

RUN yarn build

CMD ["yarn", "start"]
