/** User class for message.ly */

const db = require("../db");
const ExpressError = require("../expressError");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR, SECRET_KEY } = require("../config");

/** User of the site. */

class User {
	constructor({
		username,
		first_name,
		last_name,
		phone,
		join_at,
		last_login_at,
	}) {
		this.username = username;
		this.first_name = first_name;
		this.last_name = last_name;
		this.phone = phone;
		this.join_at = join_at;
		this.last_login_at = last_login_at;
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

		// PAM: Forgot to hash the password
		const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

		const result = await db.query(
			`
			INSERT INTO users (
				username,
				password,
				first_name,
				last_name,
				phone,
				join_at,
				last_login_at
				)
			VALUES (
				$1,
				$2,
				$3,
				$4,
				$5,
				current_timestamp,
				current_timestamp
				)
			RETURNING *
			`,
			[username, hashedPassword, first_name, last_name, phone]
		);
		return result.rows[0];
	}

	/**
	 * All: basic info on all users:
	 * [{username, first_name, last_name, phone}, ...]
	 *
	 * Retrieve basic information on all users.
	 * @returns {Promise<Array>} - A Promise that resolves to an array of user objects, each containing the following properties:
	 *  - {string} username - The username of the user.
	 *  - {string} first_name - The first name of the user.
	 *  - {string} last_name - The last name of the user.
	 *  - {string} phone - The phone number of the user.
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
			   ORDER BY first_name, last_name
			   `
		);
		// PAM: use results to create user objects and then return user array made from.
		// const users = results.rows.map((u) => new User(u));
		// return users;
		return results.rows
	}

	/** Get: Retrieve user by username
	 *
	 * returns {username,
	 *          first_name,
	 *          last_name,
	 *          phone,
	 *          join_at,
	 *          last_login_at }
	 *
	 * @param {string} username - The username of the user to retrieve.
	 * @returns {Promise<Object>} - A Promise that resolves to an object containing the following user properties:
	 *   - {string} username - The username of the user.
	 *   - {string} first_name - The first name of the user.
	 *   - {string} last_name - The last name of the user.
	 *   - {string} phone - The phone number of the user.
	 *   - {string} join_at - The date and time when the user joined.
	 *   - {string} last_login_at - The date and time of the user's last login.
	 * @throws {ExpressError} - Throws a 404 error if no user is found with the specified username.
	 */
	static async get(username) {
		const result = await db.query(
			`
			SELECT 
				username,
				first_name,
				last_name, 
				phone,
				join_at,
				last_login_at
			FROM users
			WHERE username = $1		
			`,
			[username]
		);

		let user = result.rows[0];

		if (!user) {
			throw new ExpressError(`No such user by that username: ${username}`, 404);
		}

		// PAM: for in the future if i want to make a user obj with also a join_at, and last_login_at properties throught the class contructor
		// let little_user = new User(user);
		// console.log(little_user);
		// return little_user

		return {
			username: user.username,
			first_name: user.first_name,
			last_name: user.last_name,
			phone: user.phone,
			join_at: user.join_at,
			last_login_at: user.last_login_at,
		};
	}

	/** Authenticate: is this username/password valid? Returns boolean.
	 *
	 * Returns a Boolean: If the provided password matches the stored hashed password
	 *
	 * @param {string} username - The username of the user to authenticate.
	 * @param {string} password - The password to validate.
	 *
	 * @returns {boolean} - A boolean indicating whether authentication was successful.
	 *  - `true`  - indicating authentication Success.
	 *  - `false` - indicating authentication Failure.
	 *
	 * @throws {ExpressError} - Throws a 404 error if no user is found with the provided username.
	 * @throws {ExpressError} - Throws a 400 error for invalid username/password combinations.
	 */
	static async authenticate(username, password) {
		// query the db

		const results = await db.query(
			`
			SELECT username, password 
       		FROM users
       		WHERE username = $1
			`,
			[username]
		);
		const user = results.rows[0];
		if (!user) {
			throw new ExpressError(`No such user by that username: ${username}`, 404);
		}
		// use bcrypt.compare()
		if (user) {
			if (await bcrypt.compare(password, user.password)) {
				// PAM : leaving these two lines here as i might need them later
				// const token = jwt.sign({ username }, SECRET_KEY);
				// return res.json({ message: `Logged in!`, token });

				// authentication SUCESSS
				return true;
			} else {
				// authentication FAILURE
				return false;
			}
		}
		throw new ExpressError("Invalid username/password", 400);
	}

	/**
	 * Update the `last_login_at` timestamp for a user.
	 *
	 * @param {string} username - The username of the user to update.
	 *
	 * @returns {Promise<Object>} - A Promise that resolves to an object containing the updated user's username and `last_login_at` timestamp.
	 */
	static async updateLoginTimestamp(username) {
		const result = await db.query(
			`
			UPDATE users
			SET last_login_at = current_timestamp
			WHERE username = $1
			RETURNING username, last_login_at
			`,
			[username]
		);

		return result.rows[0];
	}

	/** Return messages from this user.
	 *
	 * [{id, to_user, body, sent_at, read_at}]
	 *
	 * where to_user is
	 *   {username, first_name, last_name, phone}
	 */

	static async messagesFrom(username) {
		const result = await db.query(
			`SELECT m.id,
					m.from_username,
	
					f.first_name AS from_first_name,
					f.last_name AS from_last_name,
					f.phone AS from_phone,
	
					m.to_username,
	
					t.first_name AS to_first_name,
					t.last_name AS to_last_name,
					t.phone AS to_phone,
	
					m.body,
					m.sent_at,
					m.read_at
					
			  FROM messages AS m
				JOIN users AS f ON m.from_username = f.username
				JOIN users AS t ON m.to_username = t.username
			  WHERE m.from_username = $1`,
			[username]
		);

		let m_results = result.rows;

		if (!m_results) {
			throw new ExpressError(
				`No messages sent by user with username: ${username}`,
				404
			);
		}
		let msg_arry = m_results.map((m) => {
			return {
				id: m.id,
				to_user: {
					username: m.to_username,
					first_name: m.to_first_name,
					last_name: m.to_last_name,
					phone: m.to_phone,
				},
				body: m.body,
				sent_at: m.sent_at,
				read_at: m.read_at,
			};
		});

		return msg_arry;
	}

	/** Return messages to this user.
	 *
	 * [{id, from_user, body, sent_at, read_at}]
	 *
	 * where from_user is
	 *   {username, first_name, last_name, phone}
	 */

	static async messagesTo(username) {
		const result = await db.query(
			`SELECT m.id,
					m.from_username,
	
					f.first_name AS from_first_name,
					f.last_name AS from_last_name,
					f.phone AS from_phone,
	
					m.to_username,
	
					t.first_name AS to_first_name,
					t.last_name AS to_last_name,
					t.phone AS to_phone,
	
					m.body,
					m.sent_at,
					m.read_at
					
			  FROM messages AS m
				JOIN users AS f ON m.from_username = f.username
				JOIN users AS t ON m.to_username = t.username
			  WHERE m.to_username = $1`,
			[username]
		);

		let m_results = result.rows;

		if (!m_results) {
			throw new ExpressError(
				`No messages sent to this user with username: ${username}`,
				404
			);
		}
		let msg_arry = m_results.map((m) => {
			return {
				id: m.id,
				from_user: {
					username: m.from_username,
					first_name: m.from_first_name,
					last_name: m.from_last_name,
					phone: m.from_phone,
				},
				body: m.body,
				sent_at: m.sent_at,
				read_at: m.read_at,
			};
		});

		return msg_arry;
	}
}

module.exports = User;
