/** Database connection for messagely. */

// const { Client } = require("pg");
// const { DB_URI } = require("./config");

// const client = new Client(DB_URI);

// client.connect();

// module.exports = client;

const { Client } = require("pg");
const { db_name } = require("./config");

const username = process.env.PG_USERNAME;
const password = process.env.PG_PASSWORD;
const port = process.env.PGPORT;

const db = new Client({
	host: "localhost",
	user: username,
	port: port,
	password: password,
	database: db_name,
});
db.connect();
module.exports = db;
