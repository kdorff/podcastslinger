#!/bin/bash

exec /sbin/setuser nobody node /opt/app/podcastSlinger/server.js --data $DATA --port $PORT --host $HOST --publicport $PUBLICPORT --title $TITLE --description $DESCRIPTION --image $IMAGE

  .option('-d, --data [value]', 'base path to files')
  .option('-p, --port [value]', 'port')
  .option('-h, --host [value]', 'public hostname')
  .option('-l, --publicport [value]', 'public port')
  .option('-t, --title [value]', 'public port')
  .option('-z, --description [value]', 'public port')
  .option('-i, --image [value]', 'icon for feed')