# syntax=docker/dockerfile:1.7
ARG RID=linux-musl-x64

FROM node:20-bullseye AS ui-build
WORKDIR /src
COPY package.json yarn.lock ./
COPY tsconfig.json ./
COPY frontend ./frontend
RUN corepack enable && corepack prepare yarn@1.22.19 --activate
RUN yarn install --frozen-lockfile --network-timeout 120000
RUN NODE_ENV=production yarn build --env production=true

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS backend-build
WORKDIR /src
COPY . .
COPY --from=ui-build /src/_output/UI /src/_output/UI
ARG RID
RUN dotnet msbuild -restore src/Readarr.sln -p:Configuration=Release -p:Platform=Posix -p:RuntimeIdentifiers=${RID} -t:PublishAllRids

FROM mcr.microsoft.com/dotnet/aspnet:10.0-alpine AS runtime
ARG RID
ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false
WORKDIR /app/readarr
RUN apk add --no-cache \
    ffmpeg \
    git \
    ghostscript \
    icu-libs \
    libstdc++ \
    ocrmypdf \
    poppler-utils \
    py3-pip \
    python3 \
    qpdf \
    sqlite-libs \
    tesseract-ocr \
    tesseract-ocr-data-eng \
    tzdata \
    unpaper \
  && addgroup -S bookdarr \
  && adduser -S -G bookdarr bookdarr \
  && git clone --depth 1 https://github.com/kevinhendricks/KindleUnpack.git /opt/kindleunpack \
  && rm -rf /opt/kindleunpack/.git \
  && printf '%s\n' \
      '#!/bin/sh' \
      'PYTHONPATH=/opt/kindleunpack exec python3 -m lib.kindleunpack "$@"' \
      > /usr/local/bin/kindleunpack \
  && chmod +x /usr/local/bin/kindleunpack

COPY --from=backend-build /src/_output/net10.0/${RID}/publish ./bin
COPY --from=backend-build /src/_output/Readarr.Update/net10.0/${RID}/publish ./Readarr.Update
COPY --from=backend-build /src/_output/UI ./bin/UI
COPY docker/entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh \
  && chown -R bookdarr:bookdarr /app/readarr /entrypoint.sh

USER bookdarr
EXPOSE 8787
VOLUME ["/config", "/books"]
ENTRYPOINT ["/entrypoint.sh"]
