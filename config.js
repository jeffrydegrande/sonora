var config = {
    port: 443,
    rabbitmq: {
        host: '10.10.2.15',
        queue: 'notifications',
        ttl: 30000
    },
    ssl: {
        key: '/data/code/engagor/system/certs/star_engagor_com.key',
        cert: '/data/code/engagor/system/certs/star_engagor_com.crt',
        ca: '/data/code/engagor/system/certs/DigiCertCA.crt',
    }
};

module.exports = config;
