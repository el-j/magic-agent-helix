# PHP Docker test fixture for Magic Helix plugin
FROM php:8.2-cli
WORKDIR /app
COPY . .
RUN echo '{"require": {"laravel/framework": "^10.0"}, "name": "phpapp/test"}' > composer.json && \
    echo '<?php echo "hello world\n";' > hello.php
CMD ["php", "hello.php"]
