FROM jrottenberg/ffmpeg:4.4-alpine

WORKDIR /app
COPY start.sh /app/start.sh

RUN chmod +x /app/start.sh

ENTRYPOINT ["/app/start.sh"]