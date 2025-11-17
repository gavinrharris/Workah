// db.js
const { Pool } = require('pg');
const pool = new Pool(); // uses variables from .env

module.exports = {
    query: (text, params) => pool.query(text, params),
};