# CHM Car — container image (alternative to Render Blueprint; works on Fly.io, Railway, etc.)
FROM node:22-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

ENV NODE_ENV=production
ENV PORT=3000
ENV DB_PATH=/var/data/chm.db
VOLUME /var/data
EXPOSE 3000

CMD ["node", "server.js"]
