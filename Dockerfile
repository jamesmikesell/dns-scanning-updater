FROM ubuntu:24.04

USER root

RUN apt-get update && apt-get install -y npm



RUN mkdir /dns-updater
WORKDIR /dns-updater

COPY package.json /dns-updater/
RUN npm i


COPY *.ts tsconfig.json /dns-updater/
RUN npx tsc

# To build and get a terminal
# docker build . && docker run --rm -it -v $(pwd)/secret-config.json:/dns-updater/config.json $(docker build -q .) /bin/bash

# To run
# docker build . && docker run --rm -v $(pwd)/secret-config.json:/dns-updater/config.json $(docker build -q .)

CMD ["node", "index.js"]
