FROM phusion/baseimage:0.9.11
MAINTAINER kstile <2kwv01@things>
ENV DEBIAN_FRONTEND noninteractive

# Set correct environment variables
ENV HOME /root

# Use baseimage-docker's init system
CMD ["/sbin/my_init"]

# Fix a Debianism of the nobody's uid being 65534
RUN usermod -u 99 nobody
RUN usermod -g 100 nobody

# install our dependencies and nodejs
RUN echo "deb http://archive.ubuntu.com/ubuntu precise main universe" > /etc/apt/sources.list
RUN apt-get update
RUN apt-get -y install python-software-properties git build-essential
RUN add-apt-repository -y ppa:chris-lea/node.js
RUN apt-get update
RUN apt-get -y install nodejs


# use changes to package.json to force Docker not to use the cache
# when we change our application's nodejs dependencies:
ADD package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /opt/app/podcastSlinger && cp -a /tmp/node_modules /opt/app/podcastSlinger

# podcastSlinger Configuration
VOLUME /media

# From here we load our application's code in, therefore the previous docker
# "layer" thats been cached will be used if possible
WORKDIR /opt/app/podcastSlinger
ADD . /opt/app/podcastSlinger

EXPOSE $PORT

#CMD ["node", "server.js"]

# Add podcastSlinger to runit
RUN mkdir /etc/service/podcastSlinger
ADD podcastSlinger.sh /etc/service/podcastSlinger/run
RUN chmod +x /etc/service/podcastSlinger/run