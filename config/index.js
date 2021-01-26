require('dotenv').config();

const CONFIG = {};

CONFIG.app = process.env.APP || 'dev';
CONFIG.port = process.env.PORT || '8001';

CONFIG.db_dialect = process.env.DB_DIALECT || 'mysql';
CONFIG.db_host = process.env.DB_HOST || 'localhost';
CONFIG.db_port = process.env.DB_PORT || '3306';
CONFIG.db_name = process.env.DB_NAME || 'meals';
CONFIG.db_user = process.env.DB_USER || 'root';
CONFIG.db_password = process.env.DB_PASSWORD || 'root';

CONFIG.jwt_encryption = process.env.JWT_ENCRYPTION || 'rkdtjdwhtjs';
CONFIG.jwt_expiration = process.env.JWT_EXPIRATION || '10000';

module.exports = CONFIG;
