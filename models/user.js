/** User class for message.ly */

const db = require("../db");
const ExpressError = require("../expressError");

/** User of the site. */

class User {
	constructor({ username, first_name, last_name, phone }) {
		this.username = username;
		this.first_name = first_name;
		this.last_name = last_name;
		this.phone = phone;
	}

	/** 
	 * All: basic info on all users:
	 * [{username, first_name, last_name, phone}, ...]
	 *
	 * Retrieve basic information on all users.
	 * @returns {Promise<Array>} - A Promise that resolves to an array of user objects, each containing the following properties:
	 * 		{string} username - The username of the user.
	 * 		{string} first_name - The first name of the user.
	 * 		{string} last_name - The last name of the user.
	 * 		{string} phone - The phone number of the user.
	 */

	static async all() {
		//PAM: query the db for info from users to display
		const results = await db.query(
			`SELECT 
			  	username, 
				first_name,  
				last_name, 
				phone
			   FROM users
			   ORDER BY first_name, last_name`
		);
		// PAM: use results to create user objects and then return user array made from.
		const users = results.rows.map((u) => new User(u));
		return users;
	}
	/**
	 * Register a new user -- returns
	 * {username, password, first_name, last_name, phone}
	 * 
	 * @param {Object} userDetails - The user details to be registered.
	 * @param {string} userDetails.username - The username for the new user.
	 * @param {string} userDetails.password - The hashed password for the new user.
	 * @param {string} userDetails.first_name - The first name of the new user.
	 * @param {string} userDetails.last_name - The last name of the new user.
	 * @param {string} userDetails.phone - The phone number of the new user.
	 * @returns {Promise<Object>} - A Promise that resolves to the registered user resulting row object.
	 */

	static async register({ username, password, first_name, last_name, phone }) {
		if (!username || !password || !first_name || !last_name || !phone) {
			let error_msg = `Missing required data!
			\nusername:${username}
			
			\nfirst_name:${first_name}
			\nlast_name:${last_name}
			\nphone:${phone}`;
			if (!password) {
				error_msg += "\nMissing password field!";
			}
			// PAM: was about to show the password, but on second thought maybe a msg is better.
			// \npassword:${password}

			throw new ExpressError(error_msg, 400);
		}
		const result = await db.query(
			`
			INSERT INTO users (
				username,
				password,
				first_name,
				last_name,
				phone,
				join_at
				)
			VALUES (
				$1,
				$2,
				$3,
				$4,
				$5,
				current_timestamp
				)
			RETURNING *
			`,
			[username, password, first_name, last_name, phone]
		);
		return result.rows[0];
	}

	/** Authenticate: is this username/password valid? Returns boolean. */

	static async authenticate(username, password) {}

	/** Update last_login_at for user */

	static async updateLoginTimestamp(username) {}

	/** Get: get user by username
	 *
	 * returns {username,
	 *          first_name,
	 *          last_name,
	 *          phone,
	 *          join_at,
	 *          last_login_at } */

	static async get(username) {}

	/** Return messages from this user.
	 *
	 * [{id, to_user, body, sent_at, read_at}]
	 *
	 * where to_user is
	 *   {username, first_name, last_name, phone}
	 */

	static async messagesFrom(username) {}

	/** Return messages to this user.
	 *
	 * [{id, from_user, body, sent_at, read_at}]
	 *
	 * where from_user is
	 *   {username, first_name, last_name, phone}
	 */

	static async messagesTo(username) {}
}

module.exports = User;
