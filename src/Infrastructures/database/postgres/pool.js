/* istanbul ignore file */
const { Pool } = require('pg');
const config = require('../../../Commons/config');

const pool = process.env.NODE_ENV === 'test' ? new Pool(config.test) : new Pool();

module.exports = pool;
