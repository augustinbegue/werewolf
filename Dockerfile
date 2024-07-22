FROM oven/bun:1 AS base
COPY --from=node:18 /usr/local/bin/node /usr/local/bin/node

WORKDIR /usr/src/app

FROM base AS install

RUN mkdir -p /temp/dev
COPY package.json bun.lockb /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

RUN mkdir -p /temp/prod
COPY package.json bun.lockb /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

FROM base as prerelease
COPY --from=install /temp/dev/node_modules /usr/src/app/node_modules
COPY . .

ENV NODE_ENV=production
ENV DATABASE_URL="file:/usr/src/app/prod.db"
RUN bunx prisma generate
RUN bunx prisma migrate deploy
RUN bun run build

FROM base AS release
COPY ./prisma/schema.prisma /usr/src/app/prisma/schema.prisma
COPY --from=install /temp/prod/node_modules /usr/src/app/node_modules
COPY --from=prerelease /usr/src/app/build /usr/src/app/build
COPY index.js /usr/src/app/index.js
RUN bunx prisma generate

USER bun
EXPOSE 3000
ENTRYPOINT [ "bun", "run", "index.js" ]
