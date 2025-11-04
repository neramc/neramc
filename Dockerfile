FROM wordpress:latest

# 필요한 PHP 확장 설치 (선택사항)
RUN apt-get update && apt-get install -y \
    libzip-dev \
    && docker-php-ext-install zip

# 커스텀 설정이 필요한 경우
COPY ./wp-config-extra.php /var/www/html/

EXPOSE 80