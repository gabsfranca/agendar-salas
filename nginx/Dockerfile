FROM nginx:alpine

COPY nginx.conf /etc/nginx/nginx.conf
COPY ssl/ /etc/nginx/ssl/

RUN chmod 600 -R /etc/nginx/ssl/

EXPOSE 80 443