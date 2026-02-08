#!/bin/sh

echo "Waiting for MediaMTX to start..."
sleep 5

RTSP_URL="rtsp://mediamtx:8554"

start_stream() {
    FILE=$1
    NAME=$2
    echo "Starting stream for $NAME from $FILE..."
    ffmpeg -re -stream_loop -1 -i "/videos/$FILE" -c copy -f rtsp "$RTSP_URL/$NAME" > /dev/null 2>&1 &
}

start_stream "cam1.mp4" "cam1"
start_stream "cam2.mp4" "cam2"
start_stream "cam3.mp4" "cam3"
start_stream "cam4.mp4" "cam4"
start_stream "cam5.mp4" "cam5"

wait