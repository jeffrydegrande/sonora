var config = {
    port: 9999,
    rabbitmq: {
        host: 'server07',
        queue: 'notifications',
        ttl: 30000
    }
};

module.exports = config;
