# base image
FROM node:5.2.0

# file author
MAINTAINER Jake Schmitt, jaekschmitt@gmail.com

# install components
RUN apt-get update -qq && \
    apt-get install -y build-essential && \
    apt-get install -y ruby

# install gems
RUN gem install sass --no-ri --no-rdoc

# install packages
RUN npm install grunt grunt-cli nodemon bower -g

# create source directory
RUN mkdir /src

WORKDIR /src
ADD ./package.json /src/package.json

RUN npm install

EXPOSE 3000

CMD ["grunt"]