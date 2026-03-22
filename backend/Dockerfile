FROM node:20-alpine

WORKDIR /app

COPY package.json tsconfig.json ./
COPY prisma ./prisma

RUN npm install
RUN npx prisma generate

COPY src ./src

RUN npm run build

EXPOSE 8080

CMD ["sh", "-c", "npx prisma db push && npm run start"]
