/** User class for message.ly */

const db = require("../db");

/** User of the site. */

class User {
	/**
   * Register a new user.
   * @param {Object} userDetails - The user details to be registered.
   * @param {string} userDetails.username - The username for the new user.
   * @param {string} userDetails.password - The hashed password for the new user.
   * @param {string} userDetails.first_name - The first name of the new user.
   * @param {string} userDetails.last_name - The last name of the new user.
   * @param {string} userDetails.phone - The phone number of the new user.
   * @returns {Promise<Object>} - A Promise that resolves to the registered user resulting row object.
   */

	static async register({ username, password, first_name, last_name, phone }) {
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

	/** All: basic info on all users:
	 * [{username, first_name, last_name, phone}, ...] */

	static async all() {}

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
