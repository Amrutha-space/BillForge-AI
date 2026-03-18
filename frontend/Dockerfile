FROM node:20-alpine

WORKDIR /app

COPY package.json tsconfig.json next.config.ts postcss.config.mjs tailwind.config.ts next-env.d.ts ./
COPY src ./src

RUN npm install
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]

