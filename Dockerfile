FROM node:20-alpine as build
RUN mkdir /dns-updater
WORKDIR /dns-updater

COPY package.json /dns-updater/
RUN npm i


COPY *.ts tsconfig.json /dns-updater/
RUN npx tsc


FROM node:20-alpine
RUN mkdir /dns-updater
WORKDIR /dns-updater
COPY --from=build /dns-updater/*.js /dns-updater/



# Build and get a terminal
# docker build . && docker run --rm -it -v $(pwd)/secret-config.json:/dns-updater/config.json $(docker build -q .) sh

# Build and run
# docker build . && docker run --rm -v $(pwd)/secret-config.json:/dns-updater/config.json $(docker build -q .)


# Get a terminal from github image
# docker run --rm -it -v $(pwd)/secret-config.json:/dns-updater/config.json ghcr.io/jamesmikesell/dns-scanning-updater sh

CMD ["node", "index.js"]
