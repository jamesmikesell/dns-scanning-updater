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



# To build and get a terminal
# docker build . && docker run --rm -it -v $(pwd)/secret-config.json:/dns-updater/config.json $(docker build -q .) /bin/bash

# To run
# docker build . && docker run --rm -v $(pwd)/secret-config.json:/dns-updater/config.json $(docker build -q .)


# docker run --rm -it -v $(pwd)/secret-config.json:/dns-updater/config.json ghcr.io/jamesmikesell/dns-scanning-updater /bin/bash

CMD ["node", "index.js"]
