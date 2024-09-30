FROM node:20 as build
RUN mkdir /dns-updater
WORKDIR /dns-updater

COPY package.json /dns-updater/
RUN npm i


COPY *.ts tsconfig.json /dns-updater/
RUN npx tsc
RUN npm prune --omit=dev


FROM node:20
WORKDIR /dns-updater
COPY --from=build /dns-updater /dns-updater



# Build and get a terminal
# docker build . && docker run --rm -it -v $(pwd)/secret-config.json:/dns-updater/config.json $(docker build -q .) /bind/bash

# Build and run
# docker build . && docker run --rm -v $(pwd)/secret-config.json:/dns-updater/config.json $(docker build -q .)


# Get a terminal from github image
# docker run --rm -it -v $(pwd)/secret-config.json:/dns-updater/config.json ghcr.io/jamesmikesell/dns-scanning-updater /bind/bash

CMD ["node", "index.js"]
