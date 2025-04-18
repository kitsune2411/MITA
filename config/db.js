const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const client = new Client({
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
});

client.connect();

module.exports = client;
